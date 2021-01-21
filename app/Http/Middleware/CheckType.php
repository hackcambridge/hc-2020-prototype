<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class CheckType
{

    private $allowed = array(
        "hacker"  => ["hacker", "mentor", "sponsor", "sponsor-reviewer", "committee", "admin"],
        "mentor"  => ["hacker", "mentor", "sponsor", "sponsor-reviewer", "committee", "admin"],
        // TODO - adding Hackers and Mentors for the Dashboard Sponsors pane
        "sponsor" => ["hacker", "mentor", "sponsor", "sponsor-reviewer", "committee", "admin"],
        "committee" => ["committee", "admin", "sponsor-reviewer"],
        "admin" => ["admin"],
    );

    /**
     * Handle an incoming request.
     *
     * @param \Illuminate\Http\Request $request
     * @param \Closure $next
     * @param $verify
     * @return mixed
     */
    public function handle($request, Closure $next, $verify)
    {
        if(Auth::check()) {
            // This route requires someone to have $verify
            if(!in_array(Auth::user()->type, $this->allowed[$verify])) {
                return $this->getRedirect(Auth::user()->type);
            } else {
                return $next($request);
            }
        } else {
            return redirect(route('home'));
        }
    }

    private function getRedirect($type) {
        switch ($type) {
            case "hacker": return redirect(route('dashboard_index'));
            case "mentor": return redirect(route('dashboard_index'));
            case "sponsor": return redirect(route('sponsors_dashboard'));
            case "sponsor-reviewer": return redirect(route('sponsors_dashboard'));
            case "committee": return redirect(route('committee_dashboard'));
            default: return redirect(route('home'));
        }
    }
}
