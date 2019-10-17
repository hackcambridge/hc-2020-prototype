<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\TeamMember;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use App\Http\Resources\TeamMember as TeamMemberResource;

class Dashboard extends Controller
{
    private $maximum_team_size = 5;

    public function index()
    {
        return view('dashboard/index');
    }

    public function api_get(Request $request, $path) {
        $r = $request->request;
        switch ($path) {
            case "init": return $this->initSession();
            case "application-record": return $this->getApplicationRecord($r);
            default: return $this->fail("Route not found");
        }
    }

    public function api_post(Request $request, $path) {
        $r = $request->request;
        switch ($path) {
            case "update-application": return $this->updateApplicationRecord($r);
            case "create-team": return $this->createTeam($r);
            case "set-team": return $this->setTeam($r);
            case "leave-team": return $this->leaveTeam($r);
            case "get-team": return $this->getTeam($r);
            case "remove-team-member": return $this->removeTeamMember($r);
            default: return $this->fail("Route not found");
        }
    }


    /**
     * Private Functions
     */

    private function response($success = true, $message = '') {
        return response()->json([
            'success' => $success,
            'message' => $message
        ]);
    }

    private function fail($message = '') {
        return $this->response(false, $message);
    }

    private function success($message = '') {
        return $this->response(true, $message);
    }

    private function canContinue($allowed = [], $r, $stringChecks = []) {
        array_push($allowed, "committee", "admin"); // TODO "committee" temporary

        // Check the request provides all required arguments.
        // array_push($stringChecks, "sponsor_id", "sponsor_slug");
        if(Auth::check() && in_array(Auth::user()->type, $allowed)) {
            if($r) {
                foreach ($stringChecks as $param) {
                    $val = $r->get($param);
                    if(!$r->has($param)) return false;
                    // if(!$val || strlen($val) == 0) return false;
                }
                // flag
                return true;
            }
        } 
        // else {
        //     // Not logged in or user type not allowed.
        //     return false;
        // }
        return false;
    }

    private function initSession() {
        if(Auth::check()) {
            $app = Application::where("user_id", Auth::user()->id)->first();
            $team = TeamMember::where("user_id", Auth::user()->id)->first();
            $team_members = $team ? TeamMemberResource::collection(TeamMember::where("team_id", $team->team_id)->get()) : null;
            return response()->json([
                "success" => true,
                "payload" => array(
                    "baseUrl" => route("dashboard_index", array(), false),
                    "user" => array(
                        "type" => Auth::user()->type,
                        "name" => Auth::user()->name,
                        "application" => $app ? $app : null,
                        "team" => array(
                            "members" => $team_members,
                            "id" => $team ? $team->team_id : null,
                            "owner" => $team ? $team->owner : false,
                        ),
                    ),
                ),
            ]);
        }
        else {
            return $this->fail("Not logged in");
        }
    }

    private function updateApplicationRecord($r) {
        if($this->canContinue(["hacker"], $r, ["cvFilename", "cvUrl", "questionResponses", "isSubmitted"])) {
            $app = Application::where("user_id", Auth::user()->id)->first();
            if(!$app) {
                $app = new Application();
                $app->setAttribute("user_id", Auth::user()->id);
            }

            $app->setAttribute("cvFilename", $r->get("cvFilename"));
            $app->setAttribute("cvUrl", $r->get("cvUrl"));
            $app->setAttribute("questionResponses", $r->get("questionResponses"));
            $app->setAttribute("isSubmitted", $r->get("isSubmitted"));

            if($app->save()) {
                return response()->json([
                    "success" => true,
                    "payload" => $app,
                ]);
            } else {
                return $this->fail("Failed to save record");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function getApplicationRecord($r) {
        if($this->canContinue(["hacker", "committee", "admin"], $r)) {
            $app = Application::where("user_id", Auth::user()->id)->first();
            if($app) {
                return response()->json([
                    "success" => true,
                    "record" => $app,
                ]);
            } else {
                return response()->json([
                    "success" => true,
                ]);
            }
        }
        else {
            return $this->fail("Checks failed.");
        }
    }

    private function setTeam($r) {
        if($this->canContinue(["hacker"], $r, ["team_id"])) {
            $team_id = $r->get("team_id");

            // Check that team exists and isn't full.
            $num_existing_members = TeamMember::where("team_id", $team_id)->count();
            if($num_existing_members == 0) return $this->fail("Team doesn't exist.");
            else if($num_existing_members >= $this->maximum_team_size) return $this->fail("Team is full.");

            $team = TeamMember::where("user_id", Auth::user()->id)->first();
            if(!$team || ($team && $team->team_id != $team_id)) {
                $team = new TeamMember();
                $team->setAttribute("user_id", Auth::user()->id);
                $team->setAttribute("user_name", Auth::user()->name);
                $team->setAttribute("team_id", $team_id);
                $team->setAttribute("owner", false);
                
                if($team->save()) {
                    $old_records = TeamMember::where("id", "!=", $team->id)->where("user_id", Auth::user()->id);
                    if($old_records->count() == 0 || $old_records->delete()) {
                        return response()->json([
                            "success" => true,
                            "team" => TeamMemberResource::collection(TeamMember::where("team_id", $team_id)->get()),
                        ]);
                    } else {
                        return $this->fail("Failed to remove old records.");
                    }
                } else {
                    return $this->fail("Failed to save new record.");
                }
            } else {
                // Already in this team. Nothing to do.
                return $this->success("Already in this team.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function leaveTeam($r) {
        if($this->canContinue(["hacker"], $r)) {
            $team = TeamMember::where("user_id", Auth::user()->id)->first();
            if($team) {
                if($team->owner) {
                    // Pass control on.
                    $new_owner = TeamMember::where("team_id", $team->team_id)->where("user_id", "!=", Auth::user()->id)->first();
                    if($new_owner) {
                        $new_owner->setAttribute("owner", true);
                        if(!$new_owner->save()) {
                            return $this->fail("Failed to assign new owner.");
                        }
                    }
                }

                if(TeamMember::where("user_id", Auth::user()->id)->delete()) {
                    return $this->success("Successfully left team.");
                } else {
                    return $this->fail("Failed to leave team.");
                }
            } else {
                return $this->success("Not in a team to leave.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function createTeam($r) {
        if($this->canContinue(["hacker", "admin"], $r, [])) {
            $current_team = TeamMember::where("user_id", Auth::user()->id)->first();
            if($current_team) {
                return $this->fail("Already in a team.");
            } else {
                $team_id = $this->generateRandomString(8);
                while(TeamMember::where("team_id", $team_id)->first()) {
                    $team_id = $this->generateRandomString(8);
                }

                $team = new TeamMember();
                $team->setAttribute("user_id", Auth::user()->id);
                $team->setAttribute("user_name", Auth::user()->name);
                $team->setAttribute("team_id", $team_id);
                $team->setAttribute("owner", true);
                if($team->save()) {
                    return response()->json([
                        "success" => true,
                        "team_id" => $team_id,
                        "team" => TeamMemberResource::collection(TeamMember::where("team_id", $team_id)->get()),
                    ]);
                } else {
                    $this->fail("Failed to save record.");
                }
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }


    private function getTeam($r) {
        if($this->canContinue(["hacker"], $r)) {
            $team = TeamMember::where("user_id", Auth::user()->id)->first();
            if($team) {
                $team_members = TeamMember::where("team_id", $team->team_id);
                if($team_members) {
                    return response()->json([
                        "success" => true,
                        "team_id" => $team->team_id,
                        "am_owner" => $team->owner,
                        "team" => TeamMemberResource::collection($team_members->get()),
                    ]);
                }
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }


    private function removeTeamMember($r) {
        if($this->canContinue(["hacker"], $r, ["team_id", "user_id"])) {
            $team_id = $r->get("team_id");
            $user_id = $r->get("user_id");
            $candidate = TeamMember::where("team_id", $team_id)->where("user_id", $user_id)->first();
            if($candidate) {
                $our_team = TeamMember::where("team_id", $team_id)->where("user_id", Auth::user()->id)->first();
                if($our_team && $our_team->owner) {
                    if($candidate->delete()) {
                        return response()->json([
                            "success" => true,
                            "team" => TeamMemberResource::collection(TeamMember::where("team_id", $team_id)->get()),
                        ]);
                    } else {
                        return $this->fail("Failed to delete member.");
                    }
                } else {
                    return $this->fail("Don't have permission to remove this person from the group.");
                }
            } else {
                return $this->success("User already isn't in the group.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }



    private function generateRandomString($length = 10) {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }
}
