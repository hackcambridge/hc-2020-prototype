<?php

namespace App\Http\Controllers;

use App\User;
use App\Models\Application;
use App\Models\ApplicationReview;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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
            case 'random-application-for-review': return $this->getRandomApplicationToReview();
            case 'sync-review-scripts': return $this->syncReviewScripts();
            case 'list-review-scripts': return $this->getReviewScripts();
            default: return $this->fail("Route not found");
        }
    }

    public function api_post(Request $request, $path) {
        $r = $request->request;
        switch ($path) {
            case 'demote-admin': return $this->removeAdmin($r);
            case 'promote-committee': return $this->setAdmin($r);
            case 'get-application': return $this->getApplication($r);
            case 'submit-review': return $this->submitApplicationReview($r);
            case 'save-review-script': return $this->saveReviewScript($r);
            case 'run-review-script': return $this->runReviewScript($r);
            case 'load-review-script': return $this->loadReviewScript($r);
            case 'delete-review-script': return $this->deleteReviewScript($r);
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
            $reviews = DB::table('application_reviews')
                ->join("users", "users.id", "=", "application_reviews.user_id")
                ->groupBy('application_reviews.user_id')
                ->select("name", DB::raw('count(*) as reviews'))->get();
            return response()->json([
                "success" => true,
                "overview" => array(
                    "users" => DB::table('users')->where('users.type', '=', 'hacker')->count(),
                    "applications" => array(
                        "total" => $applications->where('applications.isSubmitted', true)->count()
                    ),
                    "reviews" => $reviews
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


    private function getApplication($r) {
        if($this->canContinue($r, ["id"], false)) {
            $id = $r->get("id");
            $app = Application::where("id", "=", $id)->first();
            $user = User::where("id", "=", $app->user_id)->first();
            $review = ApplicationReview::where("application_id", "=", $app->id)
                                       ->where("user_id", "=", Auth::user()->id)
                                       ->first();
            if($app) {
                return response()->json([
                    'success' => true,
                    'application' => $app,
                    'user' => $user,
                    'review' => $review,
                ]);
            } else {
                return $this->fail("Application doesn't exist.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function getRandomApplicationToReview() {
        if($this->canContinue(null, [], false)) {
            // Hacker applications I haven't reviewed yet...
            $apps = DB::table('applications')
                ->select('applications.id', 'applications.isSubmitted', "applications.user_id")
                ->join("users", "users.id", "=", "applications.user_id")
                ->where("type", "=", "hacker")
                ->where("applications.isSubmitted", true)
                ->select("applications.id")
                ->rightJoin('application_reviews', 'application_reviews.application_id', '=', 'applications.id')
                ->where('application_reviews.user_id', '!=', Auth::user()->id)->orWhereNull('application_reviews.user_id')
                ->get();

            if($apps->count() > 0) {
                return $this->success($apps->random()->id);
            } else {
                return $this->fail("No more applications to review");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function submitApplicationReview($r) {
        if($this->canContinue($r, ["app_id","review_details","review_total"], false)) {
            $app_id = $r->get("app_id");
            $review_details = $r->get("review_details");
            $review_total = $r->get("review_total");
            $review = ApplicationReview::where("application_id", "=", $app_id)
                                       ->where("user_id", "=", Auth::user()->id)
                                       ->first();
            if($review) {
                // Updating record
                $review->setAttribute("review_details", $review_details);
                $review->setAttribute("review_total", $review_total);
                if($review->save()) {
                    return $this->success("Successfully saved review.");
                } else {
                    return $this->fail("Failed to update review.");
                }
            } else {
                // New review
                $review = new ApplicationReview();
                $review->setAttribute("application_id", $app_id);
                $review->setAttribute("user_id", Auth::user()->id);
                $review->setAttribute("review_details", $review_details);
                $review->setAttribute("review_total", $review_total);
                if($review->save()) {
                    return $this->success("Successfully saved review.");
                } else {
                    return $this->fail("Failed to create review.");
                }
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function getOwnReview() {
        if($this->canContinue($r, ["app_id"], false)) {
            $app_id = $r->get("app_id");
            $review = ApplicationReview::where("application_id", "=", $app_id)
                                       ->where("user_id", "=", Auth::user()->id)
                                       ->first();
            if($review) {
                return response()->json([
                    'success' => true,
                    'review' => $review,
                ]);
            } else {
                return $this->success("No review found.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }


    private function saveReviewScript($r) {
        if($this->canContinue($r, ["name", "content"], true)) {
            $name = $r->get("name");
            $content = $r->get("content");

            // Save file locally and remotely.
            $output = "reviewing/". Committee::slugify($name) .".php";
            if(Storage::disk('s3')->put($output, $content)) {
                if(Storage::disk('local')->put($output, $content)) {
                    return $this->success("File successfully saved.");
                } else {
                    return $this->fail("Failed to save file locally.");
                }
            } else {
                return $this->fail("Failed to save file remotely.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function deleteReviewScript($r) {
        if($this->canContinue($r, ["name"], true)) {
            $name = $r->get("name");

            $output = "reviewing/". Committee::slugify($name) .".php";
            if(Storage::disk('s3')->delete($output)) {
                if(Storage::disk('local')->delete($output)) {
                    return $this->success("File deleted");
                } else {
                    return $this->fail("Failed to delete local copy");
                }
            } else {
                return $this->fail("Failed to delete remote copy");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function syncReviewScripts() {
        if($this->canContinue(null, [], true)) {
            $files = Storage::disk('local')->allFiles('reviewing');
            if($files) {
                $successes = 0;
                foreach($files as $file) {
                    if(Storage::disk('local')->put($file, Storage::disk('s3')->get($file))) {
                        $successes++; 
                    }
                }

                return $this->success("Retrieved ".$successes."/".count($files)." files");
            } else {
                return $this->fail("Failed to retrieve files index.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function runReviewScript($r) {
        if($this->canContinue($r, ["name"], true)) {
            $name = $r->get("name");
            $output = "reviewing/". Committee::slugify($name) .".php";
            require_once(Storage::disk('local')->path('') . $output);
            try {
                return response()->json([
                    "success" => true,
                    "results" => \Reviewing\ApplicationReviewer::review(),
                ]);
            } catch (Exception $e) {
                return $this->fail($e->getMessage());
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function getReviewScripts() {
        if($this->canContinue(null, [], true)) {
            $files = Storage::disk('local')->allFiles('reviewing');
            if($files) {
                return response()->json([
                    "success" => true,
                    "scripts" => array_map(function($file) {
                        return substr(strstr($file, "/"), 1);
                    }, $files),
                ]);
            } else {
                return $this->success("No scripts found.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function loadReviewScript($r) {
        if($this->canContinue($r, ["name"], true)) {
            $name = $r->get("name");
            $path = storage_path() . "/app/reviewing/${name}.php";
            $content = file_get_contents($path);
            if($content) {
                return response()->json([
                    "success" => true,
                    "content" => $content,
                ]);
            } else {
                $this->fail("Failed to retrieve file.");
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
