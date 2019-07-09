<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Symfony\Component\HttpFoundation\Response;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public function index() {
        return view('welcome');
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
