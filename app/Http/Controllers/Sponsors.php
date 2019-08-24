<?php

namespace App\Http\Controllers;

class Sponsors extends Controller
{
    public function dashboard()
    {
        $sub_parts = explode("|", "oauth|asdasd");
        $type = ($sub_parts[0] == "email") ? "sponsor" :
                (($sub_parts[1] == "MyMLH") ? "hacker" : "unknown");
        return view('about', ['name' => $type]);
    }
}
