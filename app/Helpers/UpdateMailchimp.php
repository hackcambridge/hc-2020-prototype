<?php

namespace App\Helpers;

use App\User;
use GuzzleHttp\Exception\ClientException;
use MailchimpMarketing\ApiClient;
// get all users, and add them to list.
// if confirmed, tag="Participant"
// otherwise, tag="Registered"
// if user is deleted, archive them from list.

// TODO: Check if everything works properly

class UpdateMailchimp
{
    private static function emailToId($email): string
    {
        return md5(strtolower($email));
    }

    // Prototype; not polished
    // Tests if a contact's status matches $status
    // Subscriber's current status. Possible values: "subscribed", "unsubscribed", "cleaned", "pending", "transactional", or "archived"
    // https://mailchimp.com/developer/marketing/api/list-members/get-member-info/ : See Success Response for possible fields (e.g. ['status']) that we can pass into getListMember()
    private function contactIsStatus($mailchimp, $AUDIENCE_ID, $email, $status = 'pending'): ?bool
    {
        try {
            return $mailchimp->lists->getListMember($AUDIENCE_ID, self::emailToId($email), ['status'])->status === $status;
        } catch (ClientException $e) {
            return null;
        }
    }

    /**
     * @param ApiClient $mailchimp
     * @param string $APPLICANTS_AUDIENCE_ID
     * @param string $PARTICIPANTS_AUDIENCE_ID
     * @param User $user . Must have information about 'id' (otherwise Eloquent ->application won't work), 'type', 'email', 'name'
     * @return void Whether operation succeeded
     */
    private static function upsertUserToMailingList(
        ApiClient $mailchimp,
        string    $APPLICANTS_AUDIENCE_ID,
        string $PARTICIPANTS_AUDIENCE_ID,
        User      $user
    ): void
    {
        try {
            $hackerStatus = $user->type === 'hacker';
//            $committeeStatus = $user->type === 'committee';  // todo: add all possible user types
            $hasRegistered = $hackerStatus && !$user->application;
            $startedApp = $hackerStatus && $user->application && !$user->application->isSubmitted;
            $hasSubmitted = $hackerStatus && $user->application && $user->application->isSubmitted;
            $wasInvited = $hackerStatus && $user->application && $user->application->invited;
            $responded = $hackerStatus && $user->application &&
                ($user->application->confirmed || $user->application->rejected);
            $confirmed = $hackerStatus && $user->application && $user->application->confirmed;
            // TODO: Add things for confirmed online or in person
            # 1. Upsert
            if ($hackerStatus) {
                $mailchimp->lists->setListMember($APPLICANTS_AUDIENCE_ID, self::emailToId($user->email), [
                    'email_address' => $user->email,
                    'status_if_new' => 'subscribed',
                    'merge_fields' => [
                        'FNAME' => $user->name,  // todo: Consider changing DB schema s.t. User stores First and Last name, instead of a combined 'name': so when we email ppl, we can say Dear '<first name>' instead of Dear '<full name>'?
                        'LNAME' => ''
                    ]
                ]);
            }
            if ($wasInvited || $responded || $confirmed) {
                $mailchimp->lists->setListMember($PARTICIPANTS_AUDIENCE_ID, self::emailToId($user->email), [
                    'email_address' => $user->email,
                    'status_if_new' => 'subscribed',
                    'merge_fields' => [
                        'FNAME' => $user->name,  // todo: Consider changing DB schema s.t. User stores First and Last name, instead of a combined 'name': so when we email ppl, we can say Dear '<first name>' instead of Dear '<full name>'?
                        'LNAME' => ''
                    ]
                ]);
            }
            # 2. Update tags
            if ($hackerStatus) {
                $ntags_applicants = [
                    ['name' => 'Registered', 'status' => $hasRegistered ? 'active' : 'inactive'],
                    ['name' => 'Started_Application', 'status' => $startedApp ? 'active' : 'inactive'],
                    ['name' => 'Submitted', 'status' => $hasSubmitted ? 'active' : 'inactive'],
                ];
                $ntags_participants = [
                    ['name' => 'Invited', 'status' => $wasInvited ? 'active' : 'inactive'],
                    ['name' => 'Responded', 'status' => $responded ? 'active' : 'inactive'],
                    ['name' => 'Confirmed', 'status' => $confirmed ? 'active' : 'inactive']
                ];
                $mailchimp->lists->updateListMemberTags($APPLICANTS_AUDIENCE_ID, self::emailToId($user->email), [
                    "tags" => $ntags_applicants
                ]);
                $mailchimp->lists->updateListMemberTags($PARTICIPANTS_AUDIENCE_ID, self::emailToId($user->email), [
                    "tags" => $ntags_participants
                ]);
            }
        } catch (ClientException $e) {
            dd($e->getMessage(), $user);
            // todo: Not sure what's the general way to deal with exceptions in this codebase...
        }
    }

    /**
     * @param ApiClient $mailchimp
     * @param string $AUDIENCE_ID
     * @return void
     */
    private static function deleteFromMailingListIfNotInDatabase(ApiClient $mailchimp, string $AUDIENCE_ID) {
        $allMailchimpIdsInDatabase = User::pluck('email')->map(function ($e) {
            return self::emailToId($e);
        })->toArray();
        $allMailchimpIdsInMailchimp = array_column($mailchimp->lists->getListMembersInfo($AUDIENCE_ID, ['members.id'])->members, 'id');
        $idsToRemove = array_diff($allMailchimpIdsInMailchimp, $allMailchimpIdsInDatabase);  // Mailchimp minus Database (in Mailchimp but not in Database) : These users should be removed from Mailchimp.
        foreach ($idsToRemove as $id) {
            $mailchimp->lists->updateListMember($AUDIENCE_ID, $id, ["status"=>"unsubscribed"]);
        }
    }

    /*
     * Terminology in MailChimp:
     * - Contact: 1 person
     * - Audience: All contacts
     * Mailchimp Free tier only allows 1 Audience. So we'll be using Tags to subdivide the audience.
     */
    /**
     * Exposed function: run this every 24h to sync the database to the Mailchimp server.
     * @return void
     */
    public function main(): void
    {
        # 1. SETUP
        $mailchimp = new ApiClient();
        $mailchimp->setConfig([
            'apiKey' => env('MAILCHIMP_KEY'),  // Test API key. Replace with your own so you can test it out.
            'server' => env('MAILCHIMP_DOMAIN')
        ]);
        $APPLICANTS_AUDIENCE_ID = env('MAILCHIMP_APPLICANT_LIST');
        $PARTICIPANTS_AUDIENCE_ID = env('MAILCHIMP_PARTICIPANT_LIST');
        // Todo? : add code to discover "pending" (Mailchimp terminology) users
        // ^above to-do is not applicable if we never ever let users be in the "pending" state: i.e. we always add them in the "subscribed state"

        # 2. DELETE users from Mailchimp that are not in database
        self::deleteFromMailingListIfNotInDatabase($mailchimp, $APPLICANTS_AUDIENCE_ID);
        self::deleteFromMailingListIfNotInDatabase($mailchimp, $PARTICIPANTS_AUDIENCE_ID);

        # 3. UPSERT everyone else in database into Mailchimp
        $allUsers = User::select('id', 'email', 'name', 'type')->get();
        foreach ($allUsers as $user) {
            self::upsertUserToMailingList($mailchimp, $APPLICANTS_AUDIENCE_ID, $PARTICIPANTS_AUDIENCE_ID, $user);
        }
        echo 'success';
    }
    public function __invoke()
    {
        $this->main();
    }
}
