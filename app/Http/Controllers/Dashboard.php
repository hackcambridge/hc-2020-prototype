<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

class Dashboard extends Controller
{
    public function index()
    {
        return view('dashboard/index');
    }

    public function api_get($path) {
        switch ($path) {
            case "init": return $this->initSession();
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
                    if(!$val || strlen($val) == 0) return false;
                }
                // flag
                return true;
            }
        } else {
            // Not logged in or user type not allowed.
            return false;
        }

        // $id = $r->get("sponsor_id");
        // $slug = $r->get("sponsor_slug");
        // $sponsor = Sponsor::where("id", $id)
        //     ->where("slug", $slug)
        //     ->first();

        // if($sponsor) {
        //     if(in_array(Auth::user()->type, ["admin", "committee"])) return true;

        //     // Try to find agent record.
        //     $agent = $sponsor->agents()
        //                       ->where("type", "agent")
        //                       ->where("email", Auth::user()->email)
        //                       ->get();
        //     if($agent && Auth::user()->type == "sponsor") {
        //         return true;
        //     }
        // }

        return false;
    }

    private function initSession() {
        if(Auth::check()) {
            // $sponsors = array();
            // if(in_array(Auth::user()->type, ["admin", "committee", "hacker"])) {
            //     $sponsors = Sponsor::all();
            // } else {
            //     $sponsors = Sponsor::whereIn('id', function($query){
            //         $query->select('sponsor_id')
            //             ->from(with(new SponsorAgent)->getTable())
            //             ->where("email", Auth::user()->email);
            //     })->get();
            // }

            return response()->json([
                "success" => true,
                "payload" => array(
                    "baseUrl" => route("dashboard_index", array(), false),
                    "user" => array(
                        "type" => Auth::user()->type,
                        "name" => Auth::user()->name,
                    ),
                ),
            ]);
        }
    }
}
