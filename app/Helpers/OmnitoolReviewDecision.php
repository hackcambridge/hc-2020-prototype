<?php
namespace App\Helpers;
use Illuminate\Support\Facades\Storage;

class OmnitoolReviewDecision {
    private $decisions = array();

    public function addApplicationDecision($user, $application, $score=0, $adjustment=0, $decision="ignore") {
        $id = $user->id;
        $this->decisions[$id] = array(
            "id" => $id,
            "user" => $user,
            "application" => $application,
            "score" => $score,
            "adjustment" => $adjustment,
            "decision" => $decision
        );
    }

    public function getCountries() {
        $countriesPath = Storage::disk('root')->path('') . "countries.json";
        $countriesData = file_get_contents($countriesPath);
        return json_decode($countriesData);
    }

    public function finalDecisionObject() {
        return $this->decisions;
    }
}