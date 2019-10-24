<?php

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\Response;

class Home extends Controller
{
    public function index() {
        return view('frontpages/index');
    }

 	public function about() {
		return view('about');
	}

    public function info() {
        ob_start();
        phpinfo();
        $phpinfo = ob_get_clean();
        return new Response(
            '<html><body>'.$phpinfo.'</body></html>'
        );
    }
}
