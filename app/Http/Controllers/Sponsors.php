<?php

namespace App\Http\Controllers;

use \RecursiveIteratorIterator,RecursiveArrayIterator;
use App\Models\Sponsor;
use App\Models\SponsorAgent;
use App\Models\SponsorDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\Sponsor as SponsorResource;
use App\Helpers\S3Management;
use App\Helpers\Auth0Management;


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
            case 'get-sponsors-display': return $this->getSponsorsDisplay();
            case 'get-resources': return $this->loadAllResources();
            default: return $this->fail("Route not found");
        }

    }

    public function api_post(Request $request, $path) {
        $r = $request->request;
        switch ($path) {
            case 'store-asset': return $this->storeAsset($request);
            case 'remove-asset': return $this->removeAsset($request);
            case 'add-sponsor': return $this->addSponsor($r);
            case 'delete-sponsor': return $this->deleteSponsor($r);
            case 'update-sponsor': return $this->sponsorAdminDetailsUpdate($r);
            case 'load-agents-access': return $this->loadSponsorAgents($r, "access");
            case 'load-agents-mentor': return $this->loadSponsorAgents($r, "mentor", ["sponsor", "sponsor-reviewer", "admin"]);
            case 'load-agents-recruiter': return $this->loadSponsorAgents($r, "recruiter", ["sponsor", "sponsor-reviewer", "admin"]);
            case 'add-agent-access': return $this->addSponsorAgent($r, "access");
            case 'add-agent-mentor': return $this->addSponsorAgent($r, "mentor", ["sponsor", "sponsor-reviewer", "admin"]);
            case 'add-agent-recruiter': return $this->addSponsorAgent($r, "recruiter", ["sponsor", "sponsor-reviewer", "admin"]);
            case 'remove-agent-access': return $this->removeSponsorAgent($r, "access");
            case 'remove-agent-mentor': return $this->removeSponsorAgent($r, "mentor", ["sponsor", "sponsor-reviewer", "admin"]);
            case 'remove-agent-recruiter': return $this->removeSponsorAgent($r, "recruiter", ["sponsor", "sponsor-reviewer", "admin"]);
            case 'add-resource': return $this->addResource($r);
            case 'load-resources': return $this->loadResources($r);
            case 'delete-resource': return $this->deleteResource($r);
            case 'get-sponsors-list': return $this->getSponsorsList($r);
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
        array_push($allowed, "committee", "admin");

        // Check the request provides all required arguments.
        array_push($stringChecks, "sponsor_id", "sponsor_slug");
        if(Auth::check() && in_array(Auth::user()->type, $allowed)) {
            if($r) {
                foreach ($stringChecks as $param) {
                    $val = $r->get($param);
                    if(!$val || strlen($val) == 0) return false;
                }
            }
        } else {
            // Not logged in or user type not allowed.
            return false;
        }

        $id = $r->get("sponsor_id");
        $slug = $r->get("sponsor_slug");
        $sponsor = Sponsor::where("id", $id)
            ->where("slug", $slug)
            ->first();

        if($sponsor) {
            if(in_array(Auth::user()->type, ["admin", "committee"])) return true;

            // Try to find agent record.
            $agent = $sponsor->agents()
                              ->where("type", "agent")
                              ->where("email", Auth::user()->email)
                              ->get();
            if($agent && (Auth::user()->type == "sponsor" || Auth::user()->type == "sponsor-reviewer")) {
                return true;
            }
        }

        return false;
    }

    private function initSession() {
        if(Auth::check()) {
            $sponsors = array();
            if(in_array(Auth::user()->type, ["admin", "committee"])) {
                $sponsors = Sponsor::all();
            } else {
                $sponsors = Sponsor::whereIn('id', function($query){
                    $query->select('sponsor_id')
                        ->from(with(new SponsorAgent)->getTable())
                        ->where("email", Auth::user()->email);
                })->get();
            }

            return response()->json([
                "success" => true,
                "payload" => array(
                    "baseUrl" => route("sponsors_dashboard", array(), false),
                    "user" => array(
                        "type" => Auth::user()->type,
                        "name" => Auth::user()->name,
                        "email" => Auth::user()->email,
                    ),
                    "sponsors" => $sponsors
                ),
            ]);
        }
    }

    private function getSponsors() {
        if(Auth::check() && in_array(Auth::user()->type, ["admin", "committee"])) {
            $sponsors = Sponsor::all();
            return response()->json([
                "success" => true,
                "data" => $sponsors
            ]);
        } else {
            $this->fail("Unauthorised/unauthenticated.");
        }
    }

    private function getSponsorsDisplay() {
        if(Auth::check() && in_array(Auth::user()->type, ["admin", "committee","sponsor","hacker","sponsor-reviewer"])) {
            $sponsors = DB::table('sponsors')
                ->leftJoin('sponsor_details', 'sponsors.id', '=', 'sponsor_details.sponsor_id')
                ->where('sponsor_details.type','=','portal-info')
                ->select('sponsors.id','name','tier','payload','slug')
                ->get();
            return response()->json([
                "success" => true,
                "data" => $sponsors
            ]);
        } else {
            $this->fail("Unauthorised/unauthenticated.");
        }
    }
    
    private function getSponsorsList($r) {
        if($this->canContinue(["admin", "sponsor-reviewer", "sponsor", "committee", "hacker"], $r, [])) {
            $id = $r->get('sponsor_id');
            $slug = $r->get('sponsor_slug');

            $sponsor = DB::table('sponsors')
                ->where("sponsors.id",'=',$id)
                ->where("sponsors.slug",'=',$slug)
                ->leftJoin('sponsor_details', 'sponsors.id', '=', 'sponsor_details.sponsor_id')
                ->where('sponsor_details.type','=','portal-info')
                ->select('sponsors.id','name','tier','payload','slug')
                ->first();
            $nextSponsor = DB::table('sponsors')
                ->where("sponsors.id",'>',$id)
                ->leftJoin('sponsor_details', 'sponsors.id', '=', 'sponsor_details.sponsor_id')
                ->where('sponsor_details.type','=','portal-info')
                ->select('sponsors.id','name','tier','payload','slug')
                ->first();
            $prevSponsor = DB::table('sponsors')
                ->where("sponsors.id",'<',$id)
                ->leftJoin('sponsor_details', 'sponsors.id', '=', 'sponsor_details.sponsor_id')
                ->where('sponsor_details.type','=','portal-info')
                ->select('sponsors.id','name','tier','payload','slug')
                ->latest('sponsors.created_at')
                ->first();

            $nextID = "";
            $nextSlug = "";
            if($nextSponsor) {
                $nextID = $nextSponsor->id;
                $nextSlug = $nextSponsor->slug;
            }
            $prevID = "";
            $prevSlug = "";
            if($prevSponsor) {
                $prevID = $prevSponsor->id;
                $prevSlug = $prevSponsor->slug;
            }
            return response()->json([
                "success" => true,
                "data" => [
                    "sponsor" => $sponsor,
                    "nextSponsor" => [
                        "id" => $nextID,
                        "slug" => $nextSlug,
                    ],
                    "prevSponsor" => [
                        "id" => $prevID,
                        "slug" => $prevSlug,
                    ]
                ]
            ]);
        } else {
            $this->fail("Unauthorised/unauthenticated.");
        }
    }

    function array_flatten($array){
        $it = new RecursiveIteratorIterator(new RecursiveArrayIterator($array));
        return iterator_to_array($it, true);
   }

    private function loadAllResources() {
        if(Auth::check() && in_array(Auth::user()->type, ["admin", "committee","sponsor","hacker","sponsor-reviewer"])) {
            $sponsors = Sponsor::all();
            if ($sponsors) {
                $all_details = [];
                foreach ($sponsors as $sponsor) {
                    $sponsor_details = $sponsor->details()->get();
                    if (!$sponsor_details->isEmpty()){
                        $all_details[] = $sponsor_details;
                    }
                }
                if($all_details) {
                    $flattened_details = array_flatten($all_details);
                    return response()->json([
                        "success" => true,
                        "all_details" => $flattened_details,
                    ]);
                } else {
                    return $this->fail("No details found");
                }
            } else {
                return $this->fail("Sponsor not found");
            }
        } else {
            $this->fail("Checks failed");
        }
    }

    public function storeAsset(Request $r) {
        if($this->canContinue(["admin", "sponsor-reviewer", "sponsor"], $r->request, ["sponsor_slug"])) {
            $sponsor_slug = $r->request->get("sponsor_slug");
            if ($r->hasFile('asset')) {
                $directory = "sponsors/" . $sponsor_slug;
                $result = S3Management::storeAsset($r, $directory, null, 20000000, 'asset');
                if($result["success"]) {
                    return $result;
                } else {
                    return $this->fail("Failed to upload.");
                }
            }
            return $this->fail("No file.");
        } else {
            return $this->fail("Checks failed.");
        }
    }

    public function removeAsset(Request $r) {
        if($this->canContinue(["admin", "sponsor-reviewer", "sponsor"], $r->request, ["sponsor_slug", "asset_url"])) {
            $sponsor_slug = $r->request->get("sponsor_slug");
            $url =  $r->request->get("asset_url");

            $index_aws = strpos($url,".amazonaws.com/");
            $length = strlen($url);

            $path = substr($url, $index_aws + 15, $length - $index_aws - 15);
            $filepath = explode("/", $path, 2)[1];

            // Need to make sure the sponsor slug matches the path
            // We have:
            //  $filePath = 'sponsors/' . $sponsor_slug . '/' . $name;
            // So, explode on path: note this is unambigious since
            // we use slugify...

            $components = explode("/", $path);
            if ($components[1] != "sponsors") {
                return array(
                    "success" => false,
                    "message" => $path
                );
            }
            if ($r->request->get("sponsor_slug") != $components[2]) {
                // Not your resource...
                return $this->fail("Unable to find resource.");
            }

            $result = S3Management::deleteAsset($url);
            if($result["success"]) {
                return $result;
            } else {
                return $this->fail("Operation failed.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function addSponsor($r) {
        // TODO "committee" is temporary.
        if(Auth::check() && in_array(Auth::user()->type, ["admin","committee"])) {
            $name = $r->get("name");
            $slug = $this->slugify($name);
            if (strlen($slug) > 0) {
                $check = Sponsor::where('slug', $slug)->first();
                if (!$check) {
                    $sponsor = new Sponsor();
                    $sponsor->setAttribute("slug", $slug);
                    $sponsor->setAttribute("name", $name);
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
        if($this->canContinue(["admin","committee"], $r, ["sponsor_id", "sponsor_slug"])) {
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
        if($this->canContinue(["admin","committee"], $r, ["sponsor_slug"])) {
            $id = $r->get("sponsor_id");
            $slug = $r->get("sponsor_slug");
            $tier = $r->get("tier");
            $privileges = $r->get("privileges");

            $sponsor = Sponsor::where("id", $id)
                ->where("slug", $slug)
                ->first();
            if($sponsor) {
                if($tier) $sponsor->setAttribute("tier", $tier);
                if($privileges) $sponsor->setAttribute("privileges", $privileges);
                if($sponsor->save()) {
                    return $this->success("Details updated.");
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
        if($this->canContinue($allowed, $r, ["sponsor_id", "sponsor_slug", "email", "name"])) {
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
                    $new_agent->setAttribute("name", $name);
                    $new_agent->setAttribute("email", $email);
                    $new_agent->setAttribute("type", $type);

                    // Initialise Auth0
                    if($type == "access") {
                        $auth0 = Auth0Management::addPasswordlessUser($email, $name);
                        if(!$auth0["success"]) return $auth0;
                        else $new_agent->setAttribute("auth0_id", $auth0["message"]);
                    }

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

                    // Deinit from Auth0
                    if($type == "access") {
                        $count = SponsorAgent::where("email", "=", $email)->where("type", "=", "access")->count();
                        if($count == 1) {
                            if($agent->auth0_id) {
                                $auth0 = Auth0Management::removePasswordlessUser($agent->auth0_id);
                                if(!$auth0["success"]) return $auth0;
                            }
                        }
                    }

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
        if($this->canContinue(["admin", "sponsor-reviewer", "sponsor"], $r, ["sponsor_id", "sponsor_slug", "payload", "detail_id", "detail_type", "complete"])) {
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
        if($this->canContinue(["admin", "committee", "sponsor-reviewer", "sponsor"], $r, ["sponsor_id", "sponsor_slug"])) {
            $id = $r->get("sponsor_id");
            $slug = $r->get("sponsor_slug");
            $detail_type_list = $r->get("sponsor_details");
            $detail_type = $r->get("detail_type");
            $sponsor = Sponsor::where("id", $id)
                              ->where("slug", $slug)
                              ->first();

            if ($sponsor) {
                if($detail_type)
                    $details = $sponsor->details()->where("type", $detail_type)->get();
                elseif($detail_type_list)
                    $details = $sponsor->details()
                                        ->whereIn("type",$detail_type_list)
                                        ->get();
                else
                    $details = $sponsor->details()->get();

                if($details) {
                    return response()->json([
                        "success" => true,
                        "details" => $details,
                        "recruiters" => $sponsor->agents()->where("type", "=", "recruiter")->count(),
                        "mentors" => $sponsor->agents()->where("type", "=", "mentor")->count(),
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
        if($this->canContinue(["admin", "sponsor-reviewer", "sponsor"], $r, ["sponsor_id", "sponsor_slug", "detail_id", "detail_type"])) {
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

    private static function slugify($text) {
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
