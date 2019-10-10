<?php

namespace App\Http\Controllers;

use App\Models\Application;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class Dashboard extends Controller
{
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
            return response()->json([
                "success" => true,
                "payload" => array(
                    "baseUrl" => route("dashboard_index", array(), false),
                    "user" => array(
                        "type" => Auth::user()->type,
                        "name" => Auth::user()->name,
                        "application" => $app ? $app : null,
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
}
