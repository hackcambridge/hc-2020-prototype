<?php

namespace App\Http\Controllers;

use App\User;
use App\Models\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;


class Committee extends Controller
{
    public function index()
    {
        return view('committee/dashboard')->with("props", array(
            "baseUrl" => route("committee_dashboard", array(), false),
            "user" => array(
                "type" => Auth::user()->type,
                "name" => Auth::user()->name
            ),
        ));
    }

    public function api_get($path) {
        switch ($path) {
            case 'init': return $this->initSession();
            case 'admin-overview': return $this->getAdminOverview();
            case 'applications-summary': return $this->getApplicationsSummary();
            case 'get-members': return $this->getMembers();
            default: return $this->fail("Route not found");
        }
    }

    public function api_post(Request $request, $path) {
        $r = $request->request;
        switch ($path) {
            case 'demote-admin': return $this->removeAdmin($r);
            case 'promote-committee': return $this->setAdmin($r);
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
        if(Auth::check() && in_array(Auth::user()->type, ["committee", "admin"])) {
            return response()->json([
                "success" => true,
                "payload" => array(
                    "baseUrl" => route("committee_dashboard", array(), false),
                    "user" => array(
                        "type" => Auth::user()->type,
                        "email" => Auth::user()->email,
                        "name" => Auth::user()->name,
                    ),
                ),
            ]);
        }
        else {
            return $this->fail("Not authorised.");
        }
    }

    private function canContinue($r, $stringChecks = [], $admin_only = true) {
        $allowed = $admin_only ? ["admin"] : ["admin", "committee"];
        if(Auth::check() && in_array(Auth::user()->type, $allowed)) {
            if($r) {
                foreach ($stringChecks as $param) {
                    $val = $r->get($param);
                    if(!$r->has($param)) return false;
                }
            }
            return true;

        } else {
            // Not logged in or user type not allowed.
            return false;
        }
    }


    private function getAdminOverview() {
        if($this->canContinue(null, [], false)) {
            $applications = DB::table('applications')
                ->select('applications.id', 'applications.isSubmitted', 'applications.user_id')
                ->join('users', 'users.id', '=', 'applications.user_id')
                ->select('applications.id', 'applications.isSubmitted')
                ->where('users.type', '=', 'hacker');
            return response()->json([
                "success" => true,
                "overview" => array(
                    "users" => DB::table('users')->where('users.type', '=', 'hacker')->count(),
                    "applications" => array(
                        "total" => $applications->where('applications.isSubmitted', '1')->count()
                    )
                ),
            ]);
        } else {
            return $this->fail(Auth::user()->type);
        }
    }

    private function getApplicationsSummary() {
        if($this->canContinue(null, [], false)) {
            $applications = DB::table('applications')
                ->join('users', 'users.id', '=', 'applications.user_id')
                ->select('applications.id', 'applications.user_id', 'users.name', 'users.email', 'applications.isSubmitted')
                ->where('users.type', '=', 'hacker')
                ->orderBy('users.name')
                ->get();
            return response()->json([
                "success" => true,
                "applications" => $applications,
            ]);
        } else {
            return $this->fail(Auth::user()->type);
        }
    }


    private function getMembers() {
        if($this->canContinue(null, [], true)) {
            $admins = User::where("type", "=", "admin")->select("name", "email", "id", "type")->get();
            $committee = User::where("type", "=", "committee")->select("name", "email", "id", "type")->get();
            return response()->json([
                "success" => true,
                "admins" => $admins,
                "committee" => $committee
            ]);
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function setAdmin($r) {
        if($this->canContinue($r, ["id", "email"], true)) {
            $id = $r->get("id");
            $email = $r->get("email");
            $user = User::where("id", "=", $id)->where("email", "=", $email)->first();
            if($user) {
                if($user->type == "committee") {
                    $user->setAttribute("type", "admin");
                    if($user->save()) {
                        $admins = User::where("type", "=", "admin")->select("name", "email", "id", "type")->get();
                        $committee = User::where("type", "=", "committee")->select("name", "email", "id", "type")->get();
                        return response()->json([
                            "success" => true,
                            "admins" => $admins,
                            "committee" => $committee
                        ]);
                    } else {
                        return $this->fail("Failed to save user.");
                    }
                } else if($user->type == "admin") {
                    return $this->success("Already an admin");
                } else {
                    return $this->fail("User is not a committee member.");
                }
            } else {
                return $this->fail("User not found."); 
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function removeAdmin($r) {
        if($this->canContinue($r, ["id", "email"], true)) {
            $id = $r->get("id");
            $email = $r->get("email");
            $email_parts = explode("@", $email);
            if(count($email_parts) == 2 && $email_parts[1] == "hackcambridge.com") {
                $user = User::where("id", "=", $id)->where("email", "=", $email)->first();
                if($user) {
                    if($user->type == "admin") {
                        $user->setAttribute("type", "committee");
                        if($user->save()) {
                            $admins = User::where("type", "=", "admin")->select("name", "email", "id", "type")->get();
                            $committee = User::where("type", "=", "committee")->select("name", "email", "id", "type")->get();
                            return response()->json([
                                "success" => true,
                                "admins" => $admins,
                                "committee" => $committee
                            ]);
                        } else {
                            return $this->fail("Failed to save user.");
                        }
                    } else {
                        return $this->fail("User is not an admin.");
                    }
                } else {
                    return $this->fail("User not found."); 
                }
            } else {
                return $this->fail("Invalid or non-HC email."); 
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
