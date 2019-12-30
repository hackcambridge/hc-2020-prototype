<?php
namespace App\Helpers;
use Illuminate\Support\Facades\Storage;

class OmnitoolReviewDecision {
    private $decisions = array();

    public function addSingleApplicationDecision($user, $application, $score=0, $adjustment=0, $decision="ignore") {
        $id = $user->id;
        $this->decisions[$id] = array(
            "teamName" => "",
            "score" => $score,
            "adjustment" => $adjustment,
            "applications" => [
                array(
                    "id" => $id,
                    "user" => $user,
                    "application" => $application,
                    "score" => $score,
                    "adjustment" => $adjustment,
                ),
            ],
            "decision" => $decision,
        );
    }

    public function addTeamDecisionEntry($user, $application, $team, $score=0, $adjustment=0) {
        $id = "team_" . $team;
        if(array_key_exists($id, $this->decisions)) {
            $this->decisions[$id]["applications"][] = array(
                "id" => $user->id,
                "user" => $user,
                "application" => $application,
                "score" => $score,
                "adjustment" => $adjustment,
            );
        } else {
            $this->decisions[$id] = array(
                "teamName" => $team,
                "score" => -1,
                "adjustment" => -1,
                "applications" => [
                    array(
                        "id" => $user->id,
                        "user" => $user,
                        "application" => $application,
                        "score" => $score,
                        "adjustment" => $adjustment,
                    ),
                ],
                "decision" => "team", // temporary
            );
        }
    }

    public function getCountries() {
        $countriesPath = Storage::disk('root')->path('') . "countries.json";
        $countriesData = file_get_contents($countriesPath);
        return json_decode($countriesData);
    }

    private function processTeams($details) {
        $teams = $details["teams"];
        $decision_keys = array_keys($this->decisions);
        foreach($decision_keys as $decision_key) {
            if($this->decisions[$decision_key]["decision"] == "team") {
                // Process team entry.
                $scores = 0;
                $adjustments = 0;
                foreach($this->decisions[$decision_key]["applications"] as $app) {
                    $scores += $app["score"];
                    $adjustments += $app["adjustment"];
                }
                $score = $scores / count($this->decisions[$decision_key]["applications"]); 
                $adjustment = $adjustments / count($this->decisions[$decision_key]["applications"]); 
                $complete = (count($this->decisions[$decision_key]["applications"]) == count($teams[$this->decisions[$decision_key]["teamName"]]));

                $this->decisions[$decision_key]["score"] = $score;
                $this->decisions[$decision_key]["adjustment"] = $adjustment;
                $this->decisions[$decision_key]["decision"] = ($score >= $details["cutoff"] && $complete ? "accept" : "ignore");
            }
        }
    }

    public function finalDecisionObject($details) {
        $this->processTeams($details);
        usort($this->decisions, function($a, $b) { return $a["score"] < $b["score"]; });
        return $this->decisions;
    }
}