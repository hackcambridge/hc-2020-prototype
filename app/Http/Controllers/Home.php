<?php

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class Home extends Controller
{
    public function index() {
        return view('frontpages/index');
    }

    public function apply() {
        if(Auth::check()) {
            $dashboard_url = route("dashboard_index", array(), false);
            return redirect($dashboard_url . "/apply/individual");
        }
        return view('frontpages/apply', ['open' => Dashboard::areApplicationsOpen()]);
    }

    public function conduct() {
        return view('frontpages/conduct');
    }

    public function privacy() {
        return view('frontpages/privacy');
    }

    public function terms() {
        return view('frontpages/terms');
    }

 	// public function about() {
	// 	return view('about');
	// }

    // public function info() {
    //     ob_start();
    //     phpinfo();
    //     $phpinfo = ob_get_clean();
    //     return new Response(
    //         '<html><body>'.$phpinfo.'</body></html>'
    //     );
    // }
}
