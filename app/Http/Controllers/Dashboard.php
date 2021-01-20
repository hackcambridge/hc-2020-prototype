<?php

namespace App\Http\Controllers;

use App\Helpers\S3Management;
use App\Models\Application;
use App\Models\ApplicationReview;
use App\Models\TeamMember;
use App\Models\Checkin;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

use App\Http\Resources\TeamMember as TeamMemberResource;

class Dashboard extends Controller
{
    private $maximum_team_size = 5;
    private static $accepting_applications = false;
    private static $discord_invite_url = "https://discord.gg/kBahBx4Vwa";

    public function index()
    {
        return view('dashboard/index');
    }

    public function join_discord()
    {
        if (Auth::check()) {
            $application = Application::where("user_id", "=", Auth::user()->id)->first();
            $is_attendee = false;
            if ($application) {
                $is_attendee = $application->confirmed && !$application->rejected;
            }
            if ($is_attendee || in_array(Auth::user()->type, ["admin", "committee", "sponsor", "sponsor-reviewer"])) {
                return redirect(self::$discord_invite_url);
            }
        }
        return redirect()->route('dashboard_index');
    }

    public static function areApplicationsOpen()
    {
        return self::$accepting_applications;
    }

    public function api_get(Request $request, $path)
    {
        $r = $request->request;
        switch ($path) {
            case "init":
                return $this->initSession();
            case "application-record":
                return $this->getApplicationRecord($r);
            case "decline-invitation":
                return $this->declineInvitation();
            case "get-overview-stats":
                return $this->getOverviewStats();
            case "get-profile":
                return $this->getProfile($r);
            case "participants-overview":
                return $this->getParticipantsOverview();
            default:
                return $this->fail("Route not found");
        }
    }

    public function api_post(Request $request, $path)
    {
        $r = $request->request;
        switch ($path) {
            case "update-application":
                return $this->updateApplicationRecord($request);
            case "remove-cv":
                return $this->removeCV($r);
            case "create-team":
                return $this->createTeam($r);
            case "set-team":
                return $this->setTeam($r);
            case "leave-team":
                return $this->leaveTeam($r);
            case "get-team":
                return $this->getTeam($r);
            case "remove-team-member":
                return $this->removeTeamMember($r);
            case "update-profile":
                return $this->updateProfile($r);
            case "event-code":
                return $this->addEventCode($r);
            case "teammates-finder":
                return $this->findTeammates($r);
            case "accept-invitation":
                return $this->acceptInvitation($r);
            default:
                return $this->fail("Route not found");
        }
    }


    /**
     * Private Functions
     */

    private function response($success = true, $message = '')
    {
        return response()->json([
            'success' => $success,
            'message' => $message
        ]);
    }

    private function fail($message = '')
    {
        return $this->response(false, $message);
    }

    private function success($message = '')
    {
        return $this->response(true, $message);
    }

    private function canContinue($allowed = [], $r, $stringChecks = [])
    {
        array_push($allowed, "committee", "admin"); // TODO "committee" temporary

        // Check the request provides all required arguments.
        // array_push($stringChecks, "sponsor_id", "sponsor_slug");
        if (Auth::check() && in_array(Auth::user()->type, $allowed)) {
            if ($r) {
                foreach ($stringChecks as $param) {
                    $val = $r->get($param);
                    if (!$r->has($param)) return false;
                    // if(!$val || strlen($val) == 0) return false;
                }
            }
            return true;
        }
        return false;
    }

    private function initSession()
    {
        if (Auth::check()) {
            $app = Application::where("user_id", Auth::user()->id)->first();
            if ($app) {
                $is_reviewed = ApplicationReview::where("application_id", "=", $app->getAttribute("id"))->count();
                $app->reviewed = ($is_reviewed > 0 || !self::$accepting_applications) ? 1 : 0;
            }
            $team = TeamMember::where("user_id", Auth::user()->id)->first();
            $team_members = $team ? TeamMemberResource::collection(TeamMember::where("team_id", $team->team_id)->get()) : null;
            $storageUrl = 'https://s3.' . env('AWS_DEFAULT_REGION') . '.amazonaws.com/' . env('AWS_BUCKET') . '/';

            return response()->json([
                "success" => true,
                "payload" => array(
                    "baseUrl" => route("dashboard_index", array(), false),
                    "baseStorageUrl" => $storageUrl,
                    "canApply" => self::$accepting_applications,
                    "user" => array(
                        "type" => Auth::user()->type,
                        "email" => Auth::user()->email,
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
        } else {
            return $this->fail("Not logged in");
        }
    }

    private function getOverviewStats()
    {
        if (Auth::check()) {
            $allowed = in_array(Auth::user()->type, ["admin", "committee", "sponsor", "sponsor-reviewer"]);
            if (!$allowed) {
                $application = Application::where("user_id", "=", Auth::user()->id)->first();
                $allowed = $application && $application->confirmed && !$application->rejected;
            }
            if ($allowed) {
                $checked_in = Checkin::count();
                return response()->json([
                    "success" => true,
                    "stats" => [
                        "checkedIn" => $checked_in,
                    ]
                ]);
            } else {
                return $this->fail("Not authorised.");
            }
        } else {
            return $this->fail("Not logged in.");
        }
    }

    private function getProfile($r)
    {
        if ($this->canContinue(["hacker", "committee", "admin"], $r)) {
            $user = User::where("id", Auth::user()->id)->first();
            if ($user) {
                return response()->json([
                    "success" => true,
                    "user" => $user,
                ]);
            } else {
                return response()->json([
                    "success" => true,
                ]);
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function updateApplicationRecord($request)
    {
        $r = $request->request;
        if (!self::$accepting_applications) return $this->fail("Applications are closed.");

        if ($this->canContinue(["hacker"], $r, ["questionResponses", "country", "isSubmitted", "acceptedConduct", "acceptedPrivacy", "acceptedTerms"])) {
            $app = Application::where("user_id", Auth::user()->id)->first();
            if (!$app) {
                $app = new Application();
                $app->setAttribute("user_id", Auth::user()->id);
            }

            if ($request->hasFile("cvFile")) {
                if ($app->cvUrl != null) {
                    $old = S3Management::deleteAsset($app->cvUrl);
                    if (!$old["success"]) {
                        $this->fail("Failed to remove old");
                    }
                }
                $result = S3Management::storeAsset($request, 'hackers/cvs', 'pdf', 5000000, 'cvFile');
                if ($result["success"]) {
                    $app->setAttribute("cvFilename", $result["originalName"]);
                    $app->setAttribute("cvUrl", $result["data"]);
                } else {
                    return $this->fail("Failed to save file: " . $result["data"]);
                }
            }

            $app->setAttribute("questionResponses", $r->get("questionResponses"));
            $app->setAttribute("country", $r->get("country"));
            $app->setAttribute("isSubmitted", $r->get("isSubmitted") == 'true');
            // $app->setAttribute("visaRequired", $r->get("visaRequired") == 'true');
            // $app->setAttribute("visaRequiredDate", $r->get("visaRequiredDate"));
            $app->setAttribute("acceptedConduct", $r->get("acceptedConduct") == 'true');
            $app->setAttribute("acceptedPrivacy", $r->get("acceptedPrivacy") == 'true');
            $app->setAttribute("acceptedTerms", $r->get("acceptedTerms") == 'true');

            if ($app->save()) {
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

    private function getApplicationRecord($r)
    {
        if ($this->canContinue(["hacker", "committee", "admin"], $r)) {
            $app = Application::where("user_id", Auth::user()->id)->first();
            if ($app) {
                $is_reviewed = ApplicationReview::where("application_id", "=", $app->getAttribute("id"))->count();
                $app->reviewed = ($is_reviewed > 0 || !self::$accepting_applications) ? 1 : 0;
                return response()->json([
                    "success" => true,
                    "record" => $app,
                ]);
            } else {
                return response()->json([
                    "success" => true,
                ]);
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function removeCV($r)
    {
        if ($this->canContinue(["hacker"], $r, [])) {
            $app = Application::where("user_id", Auth::user()->id)->first();
            if ($app->cvUrl) {
                $removal = S3Management::deleteAsset($app->cvUrl);
                if ($removal["success"]) {
                    $app->setAttribute("cvFilename", "");
                    $app->setAttribute("cvUrl", "");
                    $app->save();
                    return $this->success("Removed CV");
                } else {
                    return $this->fail("Failed to remove CV");
                }
            } else {
                return $this->success("Removed CV");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function setTeam($r)
    {
        if ($this->canContinue(["hacker"], $r, ["team_id"])) {
            $team_id = $r->get("team_id");

            // Check that team exists and isn't full.
            $num_existing_members = TeamMember::where("team_id", $team_id)->count();
            if ($num_existing_members == 0) return $this->fail("Team doesn't exist.");
            else if ($num_existing_members >= $this->maximum_team_size) return $this->fail("Team is full.");

            $team = TeamMember::where("user_id", Auth::user()->id)->first();
            if (!$team || ($team && $team->team_id != $team_id)) {
                $team = new TeamMember();
                $team->setAttribute("user_id", Auth::user()->id);
                $team->setAttribute("team_id", $team_id);
                $team->setAttribute("owner", false);

                if ($team->save()) {
                    $old_records = TeamMember::where("id", "!=", $team->id)->where("user_id", Auth::user()->id);
                    if ($old_records->count() == 0 || $old_records->delete()) {
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

    private function leaveTeam($r)
    {
        if ($this->canContinue(["hacker"], $r)) {
            $team = TeamMember::where("user_id", Auth::user()->id)->first();
            if ($team) {
                if ($team->owner) {
                    // Pass control on.
                    $new_owner = TeamMember::where("team_id", $team->team_id)->where("user_id", "!=", Auth::user()->id)->first();
                    if ($new_owner) {
                        $new_owner->setAttribute("owner", true);
                        if (!$new_owner->save()) {
                            return $this->fail("Failed to assign new owner.");
                        }
                    }
                }

                if (TeamMember::where("user_id", Auth::user()->id)->delete()) {
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

    private function createTeam($r)
    {
        if ($this->canContinue(["hacker", "admin"], $r, [])) {
            $current_team = TeamMember::where("user_id", Auth::user()->id)->first();
            if ($current_team) {
                return $this->fail("Already in a team.");
            } else {
                $team_id = $this->generateRandomString(8);
                while (TeamMember::where("team_id", $team_id)->first()) {
                    $team_id = $this->generateRandomString(8);
                }

                $team = new TeamMember();
                $team->setAttribute("user_id", Auth::user()->id);
                $team->setAttribute("team_id", $team_id);
                $team->setAttribute("owner", true);
                if ($team->save()) {
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


    private function getTeam($r)
    {
        if ($this->canContinue(["hacker"], $r)) {
            $team = TeamMember::where("user_id", Auth::user()->id)->first();
            if ($team) {
                $team_members = TeamMember::where("team_id", $team->team_id);
                if ($team_members) {
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


    private function removeTeamMember($r)
    {
        if ($this->canContinue(["hacker"], $r, ["team_id", "user_id"])) {
            $team_id = $r->get("team_id");
            $user_id = $r->get("user_id");
            $candidate = TeamMember::where("team_id", $team_id)->where("user_id", $user_id)->first();
            if ($candidate) {
                $our_team = TeamMember::where("team_id", $team_id)->where("user_id", Auth::user()->id)->first();
                if ($our_team && $our_team->owner) {
                    if ($candidate->delete()) {
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


    public function acceptInvitation($r)
    {
        if ($this->canContinue(["hacker"], null, ["info", "messages"])) {
            $application = Application::where("user_id", "=", Auth::user()->id)->first();
            if ($application) {
                if ($application->invited) {
                    if ($application->rejected) {
                        return $this->fail("You have already rejected the invitation.");
                    } else if ($application->confirmed) {
                        return $this->success("You have already accepted the invitation.");
                    } else {
                        $application->setAttribute("agreedToInfo", $r->get("info"));
                        $application->setAttribute("agreedToMessages", $r->get("messages"));
                        $application->setAttribute("confirmed", 1);
                        if ($application->save()) {
                            $application->reviewed = 1;
                            return response()->json([
                                "success" => true,
                                "application" => $application,
                            ]);
                        } else {
                            return $this->fail("An error occurred.");
                        }
                    }
                } else {
                    return $this->fail("This invitastion doesn't exist.");
                }
            } else {
                return $this->fail("Application not found.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    public function declineInvitation()
    {
        if ($this->canContinue(["hacker"], null)) {
            $application = Application::where("user_id", "=", Auth::user()->id)->first();
            if ($application) {
                if ($application->invited) {
                    if ($application->rejected) {
                        return $this->success("You have already rejected the invitation.");
                    } else if ($application->confirmed) {
                        return $this->fail("You have already accepted the invitation.");
                    } else {
                        $application->setAttribute("rejected", 1);
                        if ($application->save()) {
                            $application->reviewed = 1;
                            return response()->json([
                                "success" => true,
                                "application" => $application,
                            ]);
                        } else {
                            return $this->fail("An error occurred.");
                        }
                    }
                } else {
                    return $this->fail("This invitation doesn't exist.");
                }
            } else {
                return $this->fail("Application not found.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function updateProfile($r)
    {
        if ($this->canContinue(["hacker", "committee", "admin"], $r, ["eventDetails"])) {
            $user = User::where("id", Auth::user()->id)->first();
            if ($user) {
                $user->setAttribute("eventDetails", $r->get("eventDetails"));
                if ($user->save()) {
                    return response()->json([
                        "success" => true,
                    ]);
                } else {
                    return $this->fail("An error occurred.");
                }
            } else {
                return $this->fail("User not found.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private static function descriptionsMatch($description, $target)
    {
        return str_contains(strtolower($description), strtolower($target)) || str_contains(strtolower($target), strtolower($description));
    }

    public function findTeammates($r)
    {
        if ($this->canContinue(["hacker", "admin", "committee"], $r, ["keywords"])) {
            $hackers = User::where("type", "=", "hacker")->select("name", "id", "email", "eventDetails")->get();
            $keywords = $r->get("keywords");

            $teams_obj = TeamMember::select('team_id', DB::raw("count(*) as members"), DB::raw('group_concat(user_id) as members'))
                ->having("members", ">", 1)
                ->groupBy("team_id")
                ->get();
            $teams = [];
            $teams_inverse = [];
            foreach ($teams_obj as $team) {
                $members = explode(",", $team->members);
                $teams[$team->team_id] = $members;
                foreach ($members as $member) {
                    $teams_inverse[$member] = $team->team_id;
                }
            }

            $matching = [];
            foreach ($hackers as $hacker) {
                $application = Application::where("user_id", "=", $hacker->id)->first();
                if (!$application || !$application->invited || !$application->confirmed) {
                    continue;
                }

                $add = 0;
                if ($hacker->eventDetails) {
                    $eventDetails = json_decode($hacker->getAttribute("eventDetails"));
                    # 1. Search in Hacker's descriptions
                    if (property_exists($eventDetails, "ideas")) {
                        foreach ($keywords as $keyword) {
                            if ($this->descriptionsMatch($eventDetails->ideas, $keyword)) {
                                $add = 1;
                                break;
                            }
                        }
                    }

                    # 2. Search in Hacker's tags
                    if (!$add && property_exists($eventDetails, "tags") && is_array($eventDetails->tags)) {
                        foreach ($keywords as $keyword) {
                            foreach ($eventDetails->tags as $tag) {
                                if ($this->descriptionsMatch($tag, $keyword)) {
                                    $add = 1;
                                    break;
                                }
                            }
                            if ($add) {
                                break;
                            }
                        }
                    }
                }

                # 3. Search in Hacker's application
                if (!$add) {
                    $responses = $application->getAttribute("questionResponses");
                    foreach ($keywords as $keyword) {
                        if ($this->descriptionsMatch($responses, $keyword)) {
                            $add = 1;
                            break;
                        }
                    }
                }

                if ($add) {
                    $slim_user = (object) ["name" => $hacker->name, "email" => $hacker->email];
                    if ($hacker->eventDetails) {
                        $eventDetails = json_decode($hacker->getAttribute("eventDetails"));
                        if (property_exists($eventDetails, "discord")) {
                            $slim_user->discord = $eventDetails->discord;
                        }
                    }
                    $slim_user->team = array_key_exists($hacker->id, $teams_inverse);
                    $matching[] = $slim_user;
                }
            }

            return response()->json([
                "success" => true,
                "hackers" => $matching,
            ]);
        } else {
            return $this->fail("Checks failed.");
        }
    }

    public function addEventCode($r)
    {
        if ($this->canContinue(["hacker", "admin", "committee"], $r, ['qrcode'])) {
            $workshopName = base64_decode($r->get("qrcode"), true);
            $token_start = "/^hexcambridge\//";
            $token_pattern = "/^hexcambridge\/[a-zA-Z0-9]+$/";
            if (preg_match($token_pattern, $workshopName)) {
                $workshopName = preg_replace($token_start, "", $workshopName);
                $user = User::where("id", Auth::user()->id)->first();
                if ($user) {
                    $eventDetails = json_decode($user->getAttribute("eventDetails"));
                    if ($eventDetails == null) {
                        $eventDetails = (object) ['workshops' => []];
                    }
                    if (!property_exists($eventDetails, "workshops") || !is_array($eventDetails->workshops)) {
                        $eventDetails->workshops = [];
                    }
                    if (!in_array($workshopName, $eventDetails->workshops)) {
                        array_push($eventDetails->workshops, $workshopName);
                    }
                    $user->setAttribute("eventDetails", json_encode($eventDetails));
                    if ($user->save()) {
                        return response()->json([
                            "success" => true,
                        ]);
                    } else {
                        return $this->fail("Could not update user.");
                    }
                }
            } else {
                return $this->fail("Invalid code.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    public function getParticipantsOverview()
    {
        if ($this->canContinue(["hacker", "admin", "committee"], null)) {
            $user_profiles = DB::table('users')
                ->rightJoin("applications", "users.id", "=", "applications.user_id")
                ->where("applications.confirmed", "=", "1")
                ->select("users.profile")
                ->get();
            $raw_data = [];
            $raw_data["universities"] = [];
            $raw_data["levels"] = [];
            $raw_data["majors"] = [];
            $raw_data["professions"] = [];
            foreach ($user_profiles as $profile) {
                $profile_data = json_decode($profile->profile);
                if (property_exists($profile_data, "school") && strlen($profile_data->school->name) > 0) {
                    $raw_data["universities"][] = $profile_data->school->name;
                }
                if (property_exists($profile_data, "level_of_study") && strlen($profile_data->level_of_study) > 0) {
                    $raw_data["levels"][] = $profile_data->level_of_study;
                }
                if (property_exists($profile_data, "major") && strlen($profile_data->major) > 0) {
                    $raw_data["majors"][] = $profile_data->major;
                }
                if (property_exists($profile_data, "profession_type") && strlen($profile_data->profession_type) > 0) {
                    $raw_data["professions"][] = $profile_data->profession_type;
                }
            }
            $data_keys = ["universities", "levels", "majors", "professions"];
            $data = [];
            foreach ($data_keys as $key) {
                $names = array_unique($raw_data[$key]);
                $count = array_count_values($raw_data[$key]);
                foreach ($names as $name) {
                    $data[$key][] = (object)[
                        "name" => $name,
                        "participants" => $count[$name],
                    ];
                }
            }

            return response()->json([
                "success" => true,
                "overview" => $data,
            ]);
        } else {
            return $this->fail(Auth::user()->type);
        }
    }

    private function generateRandomString($length = 10)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return $randomString;
    }
}
