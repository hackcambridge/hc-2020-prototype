<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Mail;
use Bogardo\Mailgun\Facades\Mailgun;

class BatchMailer {

    private $emails;
    private $data;
    private $templates;
    private $subject;
    private $generic;

    private $sent = false;
    private $successfully_sent = array();
    private $failed_to_send = array();

    function __construct($templates, $subject, $generic) {
        $this->emails = array();
        $this->data = array();
        $this->templates = $templates;
        $this->generic = $generic;
        $this->subject = $subject;
    }

    function addRecipient($email, $data) {
        $this->emails[] = $email;

        if(isset($this->generic["_defaults"])) {
            $new_data = $data;
            foreach ($this->generic["_defaults"] as $key => $value) {
                if(!isset($new_data[$key]) || strlen($new_data[$key]) == 0) {
                    $new_data[$key] = $value;
                }
            }
            $this->data[$email] = $new_data;
        } else {
            $this->data[$email] = $data;
        }
    }

    function sendAll() {
        if($this->sent) return false;

        $this->sent = true;
        $batch_index = 0;
        $batch = [];
        foreach($this->emails as $email) {
            $batch[$email] = $this->data[$email];
            $batch_index++;
            if($batch_index > 999) {
                $this->sendBatch($batch);
                $batch = [];
                $batch_index = 0;
            }
        }

        if(count($batch) > 0) {
            $this->sendBatch($batch);
        }

        return true;
    }

    function getSent() {
        return $this->successfully_sent;
    }

    function getFailed() {
        return $this->failed_to_send;
    }

    private function sendBatch($batch) {
        $result = Mailgun::send($this->templates, $this->generic, function ($msg) use ($batch) {
            $msg->to($batch)
                // ->bcc("webmaster@hackcambridge.com")
                ->from("team@hackcambridge.com", "The Hack Cambridge Team")
                ->subject($this->subject);
        });

        if(isset($result->status) && $result->status == 200) {
            foreach($batch as $email => $data) {
                $this->successfully_sent[] = $email;
            }
        } else {
            foreach($batch as $email => $data) {
                $this->failed_to_send[] = $email;
            }
        }
    }
}