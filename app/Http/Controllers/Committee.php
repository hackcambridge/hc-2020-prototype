<?php

namespace App\Http\Controllers;

use App\User;
use App\Models\Application;
use App\Models\ApplicationReview;
use App\Models\TeamMember;
use App\Models\Checkin;
use App\Models\Mentor;
use App\Helpers\BatchMailer;
use App\Helpers\Auth0Management;
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

    public function api_get($path)
    {
        switch ($path) {
            case 'init':
                return $this->initSession();
            case 'admin-overview':
                return $this->getAdminOverview();
            case 'applications-summary':
                return $this->getApplicationsSummary();
            case 'get-members':
                return $this->getMembers();
            case 'get-mentors':
                return $this->getMentors();
            case 'random-application-for-review':
                return $this->getRandomApplicationToReview();
            case 'sync-review-scripts':
                return $this->syncReviewScripts();
            case 'list-review-scripts':
                return $this->getReviewScripts();
            case 'sync-mail-templates':
                return $this->syncMailTemplates();
            case 'list-mail-templates':
                return $this->getMailTemplates();
            case 'init-checkin-tool':
                return $this->initCheckinTool();
            default:
                return $this->fail("Route not found");
        }
    }

    public function api_post(Request $request, $path)
    {
        $r = $request->request;
        switch ($path) {
            case 'demote-admin':
                return $this->removeAdmin($r);
            case 'promote-committee':
                return $this->setAdmin($r);
            case 'get-application':
                return $this->getApplication($r);
            case 'submit-review':
                return $this->submitApplicationReview($r);
            case 'save-review-script':
                return $this->saveReviewScript($r);
            case 'run-review-script':
                return $this->runReviewScript($r);
            case 'load-review-script':
                return $this->loadReviewScript($r);
            case 'delete-review-script':
                return $this->deleteReviewScript($r);
            case 'save-mail-template':
                return $this->saveMailTemplate($r);
            case 'send-mail':
                return $this->sendMail($r);
            case 'load-mail-template':
                return $this->loadMailTemplate($r);
            case 'delete-mail-template':
                return $this->deleteMailTemplate($r);
            case 'invite-applications':
                return $this->inviteApplications($r);
            case 'load-event-data-file':
                return $this->loadEventDataFile($r);
            case 'save-event-data-file':
                return $this->saveEventDataFile($r);
            case 'checkin-application':
                return $this->checkinUser($r);
            case 'uncheckin-application':
                return $this->uncheckinUser($r);
            case 'add-mentor':
                return $this->addMentor($r);
            case 'remove-mentor':
                return $this->removeMentor($r);
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

    private function initSession()
    {
        if (Auth::check() && in_array(Auth::user()->type, ["committee", "admin", "sponsor-reviewer"])) {
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
        } else {
            return $this->fail("Not authorised.");
        }
    }

    private function canContinue($r, $stringChecks = [], $admin_only = true)
    {
        $allowed = $admin_only ? ["admin"] : ["admin", "committee", "sponsor-reviewer"];
        if (Auth::check() && in_array(Auth::user()->type, $allowed)) {
            if ($r) {
                foreach ($stringChecks as $param) {
                    $val = $r->get($param);
                    if (!$r->has($param)) return false;
                }
            }
            return true;
        } else {
            // Not logged in or user type not allowed.
            return false;
        }
    }

    private function overviewBaseQuery()
    {
        return DB::table('applications')
            ->select('applications.id', 'applications.isSubmitted', 'applications.user_id')
            ->join('users', 'users.id', '=', 'applications.user_id')
            ->select('applications.id', 'applications.isSubmitted')
            ->where('users.type', '=', 'hacker');
    }

    private function getAdminOverview()
    {
        if ($this->canContinue(null, [], false)) {
            $reviews = DB::table('application_reviews')
                ->join("users", "users.id", "=", "application_reviews.user_id")
                ->groupBy('application_reviews.user_id')
                ->select("name", DB::raw('count(*) as reviews'))->get();

            $not_reviewed_count = Application::withCount(["reviews"])
                ->whereHas('user', function ($query) {
                    $query->where('type', '=', "hacker");
                })
                ->with(["user"])
                ->having("reviews_count", ">", 0)
                ->where("isSubmitted", "=", 1)
                ->where("invited", "=", 0)
                ->get()
                ->count();

            $user_profiles = DB::table('users')->select("profile")->get();
            $universities_raw = [];
            foreach ($user_profiles as $profile) {
                $profile_data = json_decode($profile->profile);
                if (property_exists($profile_data, "school")) {
                    $universities_raw[] = $profile_data->school->name;
                }
            }
            $universities_names = array_unique($universities_raw);
            $universities_count = array_count_values($universities_raw);
            $universities = [];
            foreach ($universities_names as $name) {
                $universities[] = (object)[
                    "name" => $name,
                    "participants" => $universities_count[$name],
                ];
            }

            return response()->json([
                "success" => true,
                "overview" => array(
                    "users" => DB::table('users')->where('users.type', '=', 'hacker')->count(),
                    "applications" => array(
                        "total" => $this->overviewBaseQuery()
                            ->count(),
                        "submitted" => $this->overviewBaseQuery()
                            ->where('isSubmitted', "=", 1)
                            ->count(),
                        "reviewed" => $not_reviewed_count,
                        "invited" => $this->overviewBaseQuery()
                            ->where("invited", "=", 1)
                            ->count(),
                        "invitations_pending" => $this->overviewBaseQuery()
                            ->where("invited", "=", 1)
                            ->where("rejected", "=", 0)
                            ->where("confirmed", "=", 0)
                            ->count(),
                        "accepted" => $this->overviewBaseQuery()
                            ->where("invited", "=", 1)
                            ->where("rejected", "=", 0)
                            ->where("confirmed", "=", 1)
                            ->count(),
                        "rejected" => $this->overviewBaseQuery()
                            ->where("invited", "=", 1)
                            ->where("rejected", "=", 1)
                            ->count(),
                    ),
                    "universities" => $universities,
                    "reviews" => $reviews
                ),
            ]);
        } else {
            return $this->fail(Auth::user()->type);
        }
    }

    private function getApplicationsSummary()
    {
        if ($this->canContinue(null, [], false)) {
            $applications = DB::table('applications')
                ->join('users', 'users.id', '=', 'applications.user_id')
                ->select('applications.id', 'applications.user_id', 'users.name', 'users.email', 'applications.isSubmitted', 'applications.invited', 'applications.confirmed', 'applications.rejected')
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

    private function getMembers()
    {
        if ($this->canContinue(null, [], true)) {
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

    private function getMentors()
    {
        if ($this->canContinue(null, [], true)) {
            $mentors = Mentor::all();
            return response()->json([
                "success" => true,
                "mentors" => $mentors,
            ]);
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function setAdmin($r)
    {
        if ($this->canContinue($r, ["id", "email"], true)) {
            $id = $r->get("id");
            $email = $r->get("email");
            $user = User::where("id", "=", $id)->where("email", "=", $email)->first();
            if ($user) {
                if ($user->type == "committee") {
                    $user->setAttribute("type", "admin");
                    if ($user->save()) {
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
                } else if ($user->type == "admin") {
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

    private function removeAdmin($r)
    {
        if ($this->canContinue($r, ["id", "email"], true)) {
            $id = $r->get("id");
            $email = $r->get("email");
            $email_parts = explode("@", $email);
            if (count($email_parts) == 2 && $email_parts[1] == "hackcambridge.com") {
                $user = User::where("id", "=", $id)->where("email", "=", $email)->first();
                if ($user) {
                    if ($user->type == "admin") {
                        $user->setAttribute("type", "committee");
                        if ($user->save()) {
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

    private function getApplication($r)
    {
        if ($this->canContinue($r, ["id"], false)) {
            $id = $r->get("id");
            $app = Application::where("id", "=", $id)->first();
            $user = User::where("id", "=", $app->user_id)->first();
            $review = ApplicationReview::where("application_id", "=", $app->id)
                ->where("user_id", "=", Auth::user()->id)
                ->first();
            $team = TeamMember::where("user_id", "=", $app->user_id)->first();
            $team_count = 0;
            if ($team) {
                $team_count = TeamMember::where("team_id", "=", $team->team_id)->count();
            }
            if ($app) {
                return response()->json([
                    'success' => true,
                    'application' => $app,
                    'user' => $user,
                    'review' => $review,
                    'team' => $team && $team_count > 1 ? "$team->team_id ($team_count)" : "(None)"
                ]);
            } else {
                return $this->fail("Application doesn't exist.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function getRandomApplicationToReview()
    {
        if ($this->canContinue(null, [], false)) {
            // Hacker applications I haven't reviewed yet...
            $my_reviews_q = ApplicationReview::where("user_id", "=", Auth::user()->id)->get();
            $my_reviews = [];
            foreach ($my_reviews_q as $r) {
                $my_reviews[] = $r->application_id;
            }

            $app_collection = Application::withCount(["reviews"])
                ->whereHas('user', function ($query) {
                    $query->where('type', '=', "hacker");
                })
                ->with(["user"])
                ->having("reviews_count", "<", 1)
                ->where("isSubmitted", "=", 1)
                ->where("invited", "=", 0)
                ->whereNotIn("id", $my_reviews)
                ->get();

            if ($app_collection->count() > 0) {
                return $this->success($app_collection->random()->id);
            } else {
                return $this->fail("No more applications to review");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function submitApplicationReview($r)
    {
        if ($this->canContinue($r, ["app_id", "review_details", "review_total"], false)) {
            $app_id = $r->get("app_id");
            $review_details = $r->get("review_details");
            $review_total = $r->get("review_total");
            $review = ApplicationReview::where("application_id", "=", $app_id)
                ->where("user_id", "=", Auth::user()->id)
                ->first();
            if ($review) {
                // Updating record
                $review->setAttribute("review_details", $review_details);
                $review->setAttribute("review_total", $review_total);
                if ($review->save()) {
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
                if ($review->save()) {
                    return $this->success("Successfully saved review.");
                } else {
                    return $this->fail("Failed to create review.");
                }
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function getOwnReview($r)
    {
        if ($this->canContinue($r, ["app_id"], false)) {
            $app_id = $r->get("app_id");
            $review = ApplicationReview::where("application_id", "=", $app_id)
                ->where("user_id", "=", Auth::user()->id)
                ->first();
            if ($review) {
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


    private function saveReviewScript($r)
    {
        if ($this->canContinue($r, ["name", "content"], true)) {
            $name = $r->get("name");
            $content = $r->get("content");

            // Save file locally and remotely.
            $output = "reviewing/" . Committee::slugify($name) . ".php";
            if (Storage::disk('s3')->put($output, $content)) {
                if (Storage::disk('local')->put($output, $content)) {
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

    private function deleteReviewScript($r)
    {
        if ($this->canContinue($r, ["name"], true)) {
            $name = $r->get("name");

            $output = "reviewing/" . Committee::slugify($name) . ".php";
            if (Storage::disk('s3')->delete($output)) {
                if (Storage::disk('local')->delete($output)) {
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

    private function syncReviewScripts()
    {
        if ($this->canContinue(null, [], true)) {
            $files = Storage::disk('s3')->allFiles('reviewing');
            if ($files) {
                $successes = 0;
                foreach ($files as $file) {
                    if (Storage::disk('local')->put($file, Storage::disk('s3')->get($file))) {
                        $successes++;
                    }
                }

                return $this->success("Retrieved " . $successes . "/" . count($files) . " files");
            } else {
                return $this->fail("Failed to retrieve files index.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function runReviewScript($r)
    {
        if ($this->canContinue($r, ["name"], true)) {
            $name = $r->get("name");
            $output = "reviewing/" . Committee::slugify($name) . ".php";
            try {
                $file = Storage::disk('local')->path('') . $output;
                opcache_invalidate($file);
                require_once($file);
                return response()->json([
                    "success" => true,
                    "results" => \Reviewing\ApplicationReviewer::review(),
                    "machine" => gethostname(),
                    "timestamp" => time(),
                ]);
            } catch (Exception $e) {
                return $this->fail($e->getMessage());
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function getReviewScripts()
    {
        if ($this->canContinue(null, [], true)) {
            $files = Storage::disk('local')->allFiles('reviewing');
            if ($files) {
                return response()->json([
                    "success" => true,
                    "scripts" => array_map(function ($file) {
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

    private function loadReviewScript($r)
    {
        if ($this->canContinue($r, ["name"], true)) {
            $name = $r->get("name");
            $path = storage_path() . "/app/reviewing/${name}.php";
            $content = file_get_contents($path);
            if ($content) {
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

    private function saveMailTemplate($r)
    {
        if ($this->canContinue($r, ["name", "html_content", "plaintext_content"], true)) {
            $name = $r->get("name");
            $html_content = $r->get("html_content");
            $plaintext_content = $r->get("plaintext_content");

            // Save file locally and remotely.
            $output = "templates/" . Committee::slugify($name);
            if (Storage::disk('s3')->put($output . ".html", $html_content)) {
                if (Storage::disk('local')->put($output . ".html", $html_content)) {
                    if (Storage::disk('s3')->put($output . ".txt", $plaintext_content)) {
                        if (Storage::disk('local')->put($output . ".txt", $plaintext_content)) {
                            return $this->success("Both files successfully saved.");
                        } else {
                            return $this->fail("Failed to save TXT file locally.");
                        }
                    } else {
                        return $this->fail("Failed to save TXT file remotely.");
                    }
                } else {
                    return $this->fail("Failed to save HTML file locally.");
                }
            } else {
                return $this->fail("Failed to save HTML file remotely.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function deleteMailTemplate($r)
    {
        if ($this->canContinue($r, ["name"], true)) {
            $name = $r->get("name");

            $output = "templates/" . Committee::slugify($name);
            if (Storage::disk('s3')->delete($output . '.html')) {
                if (Storage::disk('local')->delete($output . '.html')) {
                    if (Storage::disk('s3')->delete($output . '.txt')) {
                        if (Storage::disk('local')->delete($output . '.txt')) {
                            return $this->success("Both files deleted");
                        } else {
                            return $this->fail("Failed to delete TXT local copy");
                        }
                    } else {
                        return $this->fail("Failed to delete TXT remote copy");
                    }
                } else {
                    return $this->fail("Failed to delete HTML local copy");
                }
            } else {
                return $this->fail("Failed to delete HTML remote copy");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function syncMailTemplates()
    {
        if ($this->canContinue(null, [], true)) {
            $files = Storage::disk('s3')->allFiles('templates');
            if ($files) {
                $successes = 0;
                foreach ($files as $file) {
                    if (Storage::disk('local')->put($file, Storage::disk('s3')->get($file))) {
                        $successes++;
                    }
                }

                return $this->success("Retrieved " . $successes . "/" . count($files) . " files");
            } else {
                return $this->fail("Failed to retrieve files index.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function sendMail($r)
    {
        if ($this->canContinue($r, ["name", "type", "subject", "emails"], true)) {
            $name = $r->get("name");
            $subject = $r->get("subject");
            $type = $r->get("type");
            $emails = $r->get("emails");
            try {
                $path = storage_path() . "/app/templates/${name}";
                $html_content = file_get_contents($path . ".html");
                $plaintext_content = file_get_contents($path . ".txt");
                $data = [
                    "html_content" => $html_content,
                    "plaintext_content" => $plaintext_content,
                    "name" => "%name%",
                    "_defaults" => [
                        "name" => "there"
                    ]
                ];
                $mailer = new BatchMailer(['mail/EmptyBody', 'mail/text/EmptyBody'], $subject, $data);

                $users = [];
                $base_query = DB::table('applications')
                    ->select('applications.id', 'applications.isSubmitted', 'applications.user_id')
                    ->rightJoin('users', 'users.id', '=', 'applications.user_id')
                    ->select('users.name', 'users.email')
                    ->where('users.type', '=', 'hacker');
                if ($type == "hacker") {
                    $users = $base_query->get();
                } elseif ($type == "hacker_app") {
                    $users = $base_query
                        ->whereNotNull('applications.user_id')->get();
                } elseif ($type == "hacker_noapp") {
                    $users = $base_query
                        ->whereNull('applications.user_id')->get();
                } elseif ($type == "hacker_sub_app") {
                    $users = $base_query
                        ->where('applications.isSubmitted', '=', 1)->get();
                } elseif ($type == "hacker_nosub_app") {
                    $users = $base_query
                        ->where('applications.isSubmitted', '=', 0)->get();
                } elseif ($type == "hacker_inv") {
                    $users = $base_query
                        ->where('applications.isSubmitted', '=', 1)
                        ->where('applications.invited', '=', 1)->get();
                } elseif ($type == "hacker_noinv") {
                    $users = $base_query
                        ->where('applications.isSubmitted', '=', 1)
                        ->where('applications.invited', '=', 0)->get();
                } elseif ($type == "hacker_pend") {
                    $users = $base_query
                        ->where('applications.invited', '=', 1)
                        ->where('applications.confirmed', '=', 0)
                        ->where('applications.rejected', '=', 0)
                        ->get();
                } elseif ($type == "hacker_conf") {
                    $users = $base_query
                        ->where('applications.confirmed', '=', 1)->get();
                } elseif ($type == "hacker_rej") {
                    $users = $base_query
                        ->where('applications.rejected', '=', 1)->get();
                } else {
                    $emailList = explode(";", $emails);
                    $users = $base_query->whereIn("users.email", $emailList)->get();
                }

                if (empty($users)) {
                    return response()->json([
                        "success" => false,
                    ]);
                }
                foreach ($users as $app) {
                    $name = (isset($app->name) ? explode(" ", $app->name)[0] : "there");
                    $mailer->addRecipient($app->email, ["name" => $name]);
                }
                $mailer->sendAll();
                return response()->json([
                    "success" => true,
                    "emails"  => count($users),
                ]);
            } catch (Exception $e) {
                return $this->fail($e->getMessage());
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function getMailTemplates()
    {
        if ($this->canContinue(null, [], true)) {
            $files = Storage::disk('local')->allFiles('templates');
            if ($files) {
                return response()->json([
                    "success" => true,
                    "templates" => array_unique(array_map(function ($file) {
                        return substr(strstr(preg_replace('/[.](html|txt)$/', '', $file), "/"), 1);
                    }, $files)),
                ]);
            } else {
                return $this->success("No templates found.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function loadMailTemplate($r)
    {
        if ($this->canContinue($r, ["name"], true)) {
            $name = $r->get("name");
            $path = storage_path() . "/app/templates/${name}";
            $html_content = file_get_contents($path . '.html');
            $plaintext_content = file_get_contents($path . '.txt');
            if ($html_content && $plaintext_content) {
                return response()->json([
                    "success" => true,
                    "html_content" => $html_content,
                    "plaintext_content" => $plaintext_content,
                ]);
            } else {
                $this->fail("Failed to retrieve file.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function inviteApplications($r)
    {
        if ($this->canContinue($r, ["ids"], true)) {
            $ids = $r->get("ids");
            $successful = [];
            $ineligible = 0;
            foreach ($ids as $id) {
                $application = Application::where("id", "=", $id)->first();
                if ($application) {
                    $already_invited = $application->invited == 1;
                    $already_confirmed = $application->confirmed == 1;
                    $already_rejected = $application->rejected == 1;
                    if (!$already_invited && !$already_confirmed && !$already_rejected) {
                        $application->setAttribute("invited", 1);
                        $application->setAttribute("invited_on", date('Y-m-d H:i:s'));
                        if ($application->save()) {
                            $successful[] = $application;
                        }
                    } else {
                        $ineligible++;
                    }
                }
            }

            // Send emails.
            $data = [
                "content" => [
                    "Good news, we would like to invite you to join us at Hex Cambridge!",
                    "You can RSVP via the portal you used to apply; the link below will take you straight there. Invitations expire three days after they're sent, so if you're coming let us know ASAP! Please note that we don't accept RSVPs via email.",
                    "Hopefully see you in a couple of weeks!"
                ],
                "name" => "%name%",
                "signoff" => "Best wishes",
                "_defaults" => [
                    "name" => "there"
                ]
            ];
            $mailer = new BatchMailer(['mail/InvitationLink', 'mail/text/InvitationLink'], "Hex Cambridge 2021 | Invitation", $data);
            foreach ($successful as $app) {
                $name = (isset($app->user->name) ? explode(" ", $app->user->name)[0] : "there");
                $mailer->addRecipient($app->user->email, ["name" => $name]);
            }
            $mailer->sendAll();

            $num_successful = count($successful);
            $num_failed = count($ids) - $num_successful - $ineligible;
            return $this->success("Status: $num_successful / $ineligible / $num_failed");
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function loadEventDataFile($r)
    {
        if ($this->canContinue($r, ["file"], true)) {
            $name = $r->get("file");
            $path = 'event-data/' . $name;
            if (Storage::disk('s3')->has($path)) {
                $content = Storage::disk('s3')->get($path);
                $last_modified = Storage::disk('s3')->lastModified($path);
                return response()->json([
                    "success" => true,
                    "last_modified" => $last_modified,
                    "content" => $content
                ]);
            } else {
                // return $this->fail("File not found");
                return response()->json([
                    "success" => false,
                    "file" => Storage::disk('s3')->files("event-data")
                ]);
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function saveEventDataFile($r)
    {
        if ($this->canContinue($r, ["file", "last_modified", "content"], true)) {
            $name = $r->get("file");
            $old_last_modified = $r->get("last_modified");
            $content = $r->get("content");
            $path = 'event-data/' . $name;
            if (Storage::disk('s3')->exists($path)) {
                $last_modified = Storage::disk('s3')->lastModified($path);
                if ($old_last_modified != $last_modified) {
                    return $this->fail("File has changed since you opened it.");
                }
            }

            if (Storage::disk("s3")->put($path, $content)) {
                $last_modified = Storage::disk('s3')->lastModified($path);
                return response()->json([
                    "path" => $path,
                    "success" => true,
                    "last_modified" => $last_modified
                ]);
            } else {
                return $this->fail("Failed to save new file.");
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function initCheckinTool()
    {
        if ($this->canContinue(null, [], false)) {
            $applications = Application::with(["checkin", "user"])
                ->select("id", "user_id")
                ->whereHas('user', function ($query) {
                    $query->where('type', '=', "hacker");
                })
                ->where([
                    ["confirmed", "=", 1],
                    ["rejected", "=", 0]
                ])->get();
            return response()->json([
                "success" => true,
                "applications" => $applications
            ]);
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function checkinUser($r)
    {
        if ($this->canContinue($r, ["app_id"], false)) {
            $id = $r->get("app_id");
            $checkin = Checkin::where("application_id", "=", $id)->first();
            if ($checkin) {
                return $this->success("Already checked in.");
            } else {
                $checkin = new Checkin();
                $checkin->setAttribute("application_id", $id);
                if ($checkin->save()) {
                    return $this->success("Successfully checked in.");
                } else {
                    return $this->fail("Failed to check in.");
                }
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function uncheckinUser($r)
    {
        if ($this->canContinue($r, ["app_id"], false)) {
            $id = $r->get("app_id");
            $checkin = Checkin::where("application_id", "=", $id)->first();
            if (!$checkin) {
                return $this->success("Not checked in.");
            } else {
                if ($checkin->delete()) {
                    return $this->success("Successfully removed checkin.");
                } else {
                    return $this->fail("Failed to remove check in.");
                }
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function addMentor($r)
    {
        if ($this->canContinue($r, ["email", "name"])) {
            $email = $r->get("email");
            $name = $r->get("name");

            $mentor = Mentor::where("email", $email)->first();
            if (!$mentor) {
                $new_mentor = new Mentor();
                $new_mentor->setAttribute("name", $name);
                $new_mentor->setAttribute("email", $email);

                // Initialise Auth0
                $auth0 = Auth0Management::addPasswordlessUser($email, $name);
                if (!$auth0["success"]) return $auth0;
                else $new_mentor->setAttribute("auth0_id", $auth0["message"]);

                if ($new_mentor->save()) {
                    return response()->json([
                        "success" => true,
                        "mentor" => $new_mentor
                    ]);
                } else {
                    return $this->fail("Failed to save");
                }
            } else {
                $mentor->setAttribute("name", $name ? $name : "");
                if ($mentor->save()) {
                    return response()->json([
                        "success" => true,
                        "mentor" => $mentor
                    ]);
                } else {
                    return $this->fail("Failed to save existing");
                }
            }
        } else {
            return $this->fail("Checks failed.");
        }
    }

    private function removeMentor($r)
    {
        if ($this->canContinue($r, ["email"])) {
            $email = $r->get("email");

            $mentor = Mentor::where("email", $email)->first();
            if ($mentor) {

                // Deinit from Auth0
                if ($mentor->auth0_id) {
                    $auth0 = Auth0Management::removePasswordlessUser($mentor->auth0_id);
                    if (!$auth0["success"]) return $auth0;
                }

                if ($mentor->delete()) {
                    return $this->success("Successfully deleted mentor");
                } else {
                    return $this->fail("Failed to delete mentor");
                }
            } else {
                return $this->success("Mentor already doesn't exist");
            }
        } else {
            $this->fail("Checks failed.");
        }
    }

    private static function slugify($text)
    {
        $text = preg_replace('~[^\pL\d]+~u', '-', $text);
        $text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
        $text = preg_replace('~[^-\w]+~', '', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        $text = strtolower($text);
        if (empty($text)) {
            return 'n-a';
        }
        return $text;
    }
}
