<?php

namespace App\Http\Controllers;

use App\Models\Sponsor;
use App\Models\SponsorAgent;
use App\Models\SponsorDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Sponsor as SponsorResource;

class Sponsors extends Controller
{
    public function dashboard()
    {
        return view('sponsors/dashboard');
    }

    public function api_get($path) {
        switch ($path) {
            case "init": return $this->initSession();
            case 'get-sponsors': return $this->getSponsors();
            default: return $this->fail("Route not found");
        }

    }

    public function api_post(Request $request, $path) {
        $r = $request->request;
        switch ($path) {
            case 'store-asset': return $this->storeAsset($request);
            case 'add-sponsor': return $this->addSponsor($r);
            case 'delete-sponsor': return $this->deleteSponsor($r);
            case 'update-sponsor': return $this->sponsorAdminDetailsUpdate($r);
            case 'load-agents-access': return $this->loadSponsorAgents($r, "access");
            case 'load-agents-mentor': return $this->loadSponsorAgents($r, "mentor", ["sponsor", "admin"]);
            case 'load-agents-recruiter': return $this->loadSponsorAgents($r, "recruiter", ["sponsor", "admin"]);
            case 'add-agent-access': return $this->addSponsorAgent($r, "access");
            case 'add-agent-mentor': return $this->addSponsorAgent($r, "mentor", ["sponsor", "admin"]);
            case 'add-agent-recruiter': return $this->addSponsorAgent($r, "recruiter", ["sponsor", "admin"]);
            case 'remove-agent-access': return $this->removeSponsorAgent($r, "access");
            case 'remove-agent-mentor': return $this->removeSponsorAgent($r, "mentor", ["sponsor", "admin"]);
            case 'remove-agent-recruiter': return $this->removeSponsorAgent($r, "recruiter", ["sponsor", "admin"]);
            case 'add-resource': return $this->addResource($r);
            case 'load-resources': return $this->loadResources($r);
            case 'delete-resource': return $this->deleteResource($r);
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

    private function canContinue($allowed = [], $r = null, $stringChecks = []) {
        array_push($allowed, "committee");
        if(Auth::check() && in_array(Auth::user()->type, $allowed)) {
            if($r) {
                foreach ($stringChecks as $param) {
                    $val = $r->get($param);
                    if(!$val || strlen($val) == 0) return false;
                }
            }
            return true;
        }
    }

    private function initSession() {
        if($this->canContinue(["admin", "committee", "sponsor"])) {
            return response()->json([
                "success" => true,
                "payload" => array(
                    "baseUrl" => route("sponsors_dashboard", array(), false),
                    "user" => array(
                        "type" => Auth::user()->type,
                        "name" => Auth::user()->name,
                    ),
                    "sponsors" => SponsorResource::collection(Sponsor::all())
                ),
            ]);
        } else {
            return $this->fail("Checks failed.");
        }
    }

    public function storeAsset(Request $r) {
        $url = 'https://s3.' . env('AWS_DEFAULT_REGION') . '.amazonaws.com/' . env('AWS_BUCKET') . '/';
        if($this->canContinue(["admin", "sponsor"], $r->request, ["sponsor_slug"])) {
            $sponsor_slug = $r->request->get("sponsor_slug");
//            $this->validate($r, [
//                'asset' => 'required|image|max:2048'
//            ]);
            if ($r->hasFile('asset')) {
                $file = $r->file('asset');
                $name = time() . '-' . $file->getClientOriginalName();
                $filePath = 'sponsors/' . $sponsor_slug . '/' . $name;
                Storage::disk('s3')->put($filePath, file_get_contents($file));
                return $this->success($url . $filePath);
            }
            return $this->fail("No file.");
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function addSponsor($r) {
        if($this->canContinue(["admin"])) {
            $name = $r->get("name");
            $slug = $this->slugify($name);
            if (strlen($slug) > 0) {
                $check = Sponsor::where('slug', $slug)->first();
                if (!$check) {
                    $sponsor = new Sponsor();
                    $sponsor->setAttribute("slug", $slug);
                    $sponsor->setAttribute("name", $name);
                    $sponsor->save();
                    if ($sponsor->save()) {
                        return SponsorResource::make($sponsor);
                    } else {
                        return $this->fail("Failed to save new sponsor object");
                    }
                } else {
                    return $this->fail("Sponsor already exists");
                }
            } else {
                return $this->fail("Sponsor title invalid");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function deleteSponsor($r) {
        if($this->canContinue(["admin"], $r, ["sponsor_id", "sponsor_slug"])) {
            $id = $r->get("sponsor_id");
            $slug = $r->get("sponsor_slug");
            $sponsor = Sponsor::where("id", $id)
                              ->where("slug", $slug)
                              ->first();

            if($sponsor) {
                if($sponsor->delete()) {
                    return $this->success("Sponsor deleted.");
                } else {
                    return $this->fail("Failed to delete sponsor");
                }
            } else {
                return $this->success("Sponsor not found.");
            }
        } else {
            $this->fail("Checks failed.");
        }
    }

    private function sponsorAdminDetailsUpdate($r) {
        if($this->canContinue(["admin"], $r, ["slug"])) {
            $tier = $r->get("tier");
            $privileges = $r->get("privileges");
            $slug = $r->get("slug");
            $sponsor = Sponsor::where("slug", $slug)->first();
            if($sponsor) {
                if($tier) $sponsor->setAttribute("tier", $tier);
                if($privileges) $sponsor->setAttribute("privileges", $privileges);
                if($sponsor->save()) {
                    return $this->success("");
                } else {
                    return $this->fail("Save failed");
                }
            } else {
                return $this->fail("Sponsor not found");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function loadSponsorAgents($r, $type, $allowed = ["admin"]) {
        if($this->canContinue($allowed, $r, ["sponsor_id", "sponsor_slug"])) {
            $id = $r->get("sponsor_id");
            $slug = $r->get("sponsor_slug");
            $sponsor = Sponsor::where("id", $id)
                              ->where("slug", $slug)
                              ->first();

            if($sponsor) {
                $agents = $sponsor->agents()->where("type", $type)->get();
                return response()->json([
                    "success" => true,
                    "agents" => $agents
                ]);
            } else {
                $this->fail("no sponsor found");
            }
        } else {
            $this->fail("Checks failed.");
        }
    }

    // type one of 'access', 'mentor', 'recruiter'
    private function addSponsorAgent($r, $type, $allowed = ["admin"]) {
        if($this->canContinue($allowed, $r, ["sponsor_id", "sponsor_slug", "email"])) {
            $id = $r->get("sponsor_id");
            $slug = $r->get("sponsor_slug");
            $email = $r->get("email");
            $name = $r->get("name");

            $sponsor = Sponsor::where("id", $id)
                              ->where("slug", $slug)
                              ->first();
            if($sponsor) {
                $agent = $sponsor->agents()
                                 ->where("email", $email)
                                 ->where("type", $type)
                                 ->first();
                if(!$agent) {
                    $new_agent = new SponsorAgent();
                    $new_agent->setAttribute("sponsor_id", $sponsor->id);
                    $new_agent->setAttribute("name", $name ? $name : "");
                    $new_agent->setAttribute("email", $email);
                    $new_agent->setAttribute("type", $type);
                    if($new_agent->save()) {
                        return response()->json([
                            "success" => true,
                            "agent" => $new_agent
                        ]);
                    } else {
                        return $this->fail("failed to save");
                    }
                } else {
                    $agent->setAttribute("name", $name ? $name : "");
                    if($agent->save()) {
                        return response()->json([
                            "success" => true,
                            "agent" => $agent
                        ]);
                    } else {
                        return $this->fail("failed to save existing");
                    }
                }
            } else {
                return $this->fail("invalid sponsor");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function removeSponsorAgent($r, $type, $allowed = ["admin"]) {
        if($this->canContinue($allowed, $r, ["sponsor_id", "sponsor_slug", "email"])) {
            $id = $r->get("sponsor_id");
            $slug = $r->get("sponsor_slug");
            $email = $r->get("email");

            $sponsor = Sponsor::where("id", $id)
                ->where("slug", $slug)
                ->first();
            if ($sponsor) {
                $agent = $sponsor->agents()
                    ->where("email", $email)
                    ->where("type", $type)
                    ->first();
                if($agent) {
                    if($agent->delete()) {
                        return $this->success("Successfully delete agent");
                    } else {
                        return $this->fail("Failed to delete agent");
                    }
                } else {
                    return $this->success("Agent already doesn't exist");
                }
            } else {
                $this->fail("Sponsor not found");
            }
        } else {
            $this->fail("Checks failed.");
        }
    }

    private function addResource($r) {
        if($this->canContinue(["admin", "sponsor"], $r, ["sponsor_id", "sponsor_slug", "payload", "detail_id", "detail_type", "complete"])) {
            $id = $r->get("sponsor_id");
            $slug = $r->get("sponsor_slug");
            $payload = $r->get("payload");
            $complete = $r->get("complete");
            $detail_id = $r->get("detail_id");
            $detail_type = $r->get("detail_type");

            $sponsor = Sponsor::where("id", $id)
                              ->where("slug", $slug)
                              ->first();
            if ($sponsor) {
                $sponsor_detail = null;
                if($detail_id >= 0) {
                    $sponsor_detail = $sponsor->details()
                                              ->where("id", $detail_id)
                                              ->where("type", $detail_type)
                                              ->first();
                }

                if($sponsor_detail) {
                    $sponsor_detail->setAttribute("payload", $payload);
                    $sponsor_detail->setAttribute("complete", $complete);
                }
                else {
                    $sponsor_detail = new SponsorDetail();
                    $sponsor_detail->setAttribute("payload", $payload);
                    $sponsor_detail->setAttribute("complete", $complete);
                    $sponsor_detail->setAttribute("type", $detail_type);
                    $sponsor_detail->setAttribute("sponsor_id", $sponsor->id);
                }

                if ($sponsor_detail->save()) {
                    return response()->json([
                        "success" => true,
                        "detail" => array(
                            "id" => $sponsor_detail->id,
                            "payload" => $sponsor_detail->payload,
                            "complete" => $sponsor_detail->complete,
                        )
                    ]);
                } else {
                    return $this->fail("Failed to save SponsorDetail");
                }
            } else {
                $this->fail("Sponsor doesn't exist");
            }
        } else {
            $this->fail("Checks failed");
        }
    }

    private function loadResources($r) {
        if($this->canContinue(["admin", "committee", "sponsor"], $r, ["sponsor_id", "sponsor_slug"])) {
            $id = $r->get("sponsor_id");
            $slug = $r->get("sponsor_slug");
            $detail_type = $r->get("detail_type");
            $sponsor = Sponsor::where("id", $id)
                              ->where("slug", $slug)
                              ->first();

            if ($sponsor) {
                if($detail_type)
                    $details = $sponsor->details()->where("type", $detail_type)->get();
                else
                    $details = $sponsor->details()->get();

                if($details) {
                    return response()->json([
                        "success" => true,
                        "details" => $details
                    ]);
                } else {
                    $this->fail("No details found");
                }
            } else {
                return $this->fail("Sponsor not found");
            }
        } else {
            $this->fail("Checks failed");
        }
    }

    private function deleteResource($r) {
        if($this->canContinue(["admin", "sponsor"], $r, ["sponsor_id", "sponsor_slug", "detail_id", "detail_type"])) {
            $detail_id = $r->get("detail_id");
            $id = $r->get("sponsor_id");
            $slug = $r->get("sponsor_slug");
            $detail_type = $r->get("detail_type");

            $sponsor = Sponsor::where("id", $id)
                ->where("slug", $slug)
                ->first();

            if($sponsor) {
                $detail = $sponsor->details()
                                  ->where("id", $detail_id)
                                  ->where("type", $detail_type)
                                  ->first();
                if($detail) {
                    return response()->json([
                        "success" => $detail->delete(),
                        "message" => "Running delete"
                    ]);
                } else {
                    return $this->success("Detail not found");
                }
            } else {
                return $this->fail("Sponsor not found");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private static function slugify($text)
    {
        // replace non letter or digits by -
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);

        // transliterate
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);

        // remove unwanted characters
        $text = preg_replace('~[^-\w]+~', '', $text);

        // trim
        $text = trim($text, '-');

        // remove duplicate -
        $text = preg_replace('~-+~', '-', $text);

        // lowercase
        $text = strtolower($text);

        if (empty($text)) {
            return 'n-a';
        }

        return $text;
    }
}
