<?php

namespace App\Http\Controllers;

use App\Models\Sponsor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            case 'update-sponsor': return $this->sponsorAdminDetailsUpdate($r);
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

    private function initSession() {
        if(Auth::check()) {
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
            return $this->fail("Authentication failed.");
        }
    }

    private function sponsorAdminDetailsUpdate($r) {
        if(Auth::check()) {
            if(in_array(Auth::user()->type, ["admin", "committee"])) {
                $tier = $r->get("tier");
                $privileges = $r->get("privileges");
                $slug = $r->get("slug");
                if($slug && strlen($slug) > 0) {
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
                    return $this->fail("Slug not set");
                }
            } else {
                return $this->fail("Insufficient privileges");
            }
        } else {
            return $this->fail("Not logged in");
        }
    }
}
