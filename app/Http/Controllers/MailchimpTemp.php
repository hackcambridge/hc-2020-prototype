<?php

namespace App\Http\Controllers;

use App\Helpers\UpdateMailchimp;

class MailchimpTemp extends Controller
{
    public function index() {
        (new UpdateMailchimp())->main();
    }
}
