<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class S3Management {

    /**
     * Take a Request with an "asset" field and upload that to S3.
     */
    public static function storeAsset($r, $s3folder, $mimes, $maxSize, $parameterName = "asset") {
        $url = 'https://s3.' . env('AWS_DEFAULT_REGION') . '.amazonaws.com/' . env('AWS_BUCKET') . '/';
        
        if ($r->hasFile($parameterName)) {
            if ($r->file($parameterName)->isValid()){
                $file = $r->file($parameterName);
                if(!$mimes) {
                    $r->validate([$parameterName => 'required|max:'.$maxSize]);
                } else {
                    $r->validate([$parameterName => 'required|mimes:'.$mimes.'|max:'.$maxSize]);
                }
                if (strlen($file->getClientOriginalName()) > 0) {
                    $filename_parts = explode('.', $file->getClientOriginalName());
                    $extension = array_pop($filename_parts);
                    // $filename_parts = array(
                    //     S3Management::slugify(implode('-', $filename_parts)), 
                    //     $filename_last
                    // );

                    // $name = time() . '-' . implode('.', $filename_parts);
                    $name = S3Management::uuid() . '.' . $extension;
                    $filePath = $s3folder . '/' . $name;
                    if (Storage::disk('s3')->put($filePath, file_get_contents($file))){
                        return array(
                            "success" => true,
                            "data" => $url . $filePath,
                            "originalName" => $file->getClientOriginalName(),
                        );
                    } else {
                        return array(
                            "success" => false,
                            "data" => "Failed to upload."
                        );
                    }
                } else {
                    return array(
                        "success" => false,
                        "data" => "Invalid name."
                    );
                }
            } else {
                return array(
                    "success" => false,
                    "data" => "Malformed file."
                );
            }
        }
        return array(
            "success" => false,
            "data" => "No file."
        );
    }

    public static function deleteAsset($url) {
        $index_aws = strpos($url,".amazonaws.com/");
        $length = strlen($url);
        $path = substr($url, $index_aws + 15, $length - $index_aws - 15);
        $filepath = explode("/", $path, 2)[1];

        if(Storage::disk('s3')->delete($filepath)) {
            return array(
                "success" => true,
                "message" => ""
            );
        } else {
            return array(
                "success" => false,
                "message" => "Failed to remove file"
            );
        }
    }

    private static function slugify($text) {
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

    private static function uuid() {
        return sprintf( '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            // 32 bits for "time_low"
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ),
    
            // 16 bits for "time_mid"
            mt_rand( 0, 0xffff ),
    
            // 16 bits for "time_hi_and_version",
            // four most significant bits holds version number 4
            mt_rand( 0, 0x0fff ) | 0x4000,
    
            // 16 bits, 8 bits for "clk_seq_hi_res",
            // 8 bits for "clk_seq_low",
            // two most significant bits holds zero and one for variant DCE1.1
            mt_rand( 0, 0x3fff ) | 0x8000,
    
            // 48 bits for "node"
            mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff ), mt_rand( 0, 0xffff )
        );
    }
}
