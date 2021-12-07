<?php

namespace App\Helpers;

use App\User;
use GuzzleHttp\Exception\ClientException;
use MailchimpMarketing\ApiClient;

// get all users, and add them to list.
// if confirmed, tag="Participant"
// otherwise, tag="Registered"
// if user is deleted, archive them from list.
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
     * @param string $AUDIENCE_ID
     * @param User $user . Must have information about 'id' (otherwise Eloquent ->application won't work), 'type', 'email', 'name'
     * @return void Whether operation succeeded
     */
    private static function upsertUserToMailingList(
        ApiClient $mailchimp,
        string    $AUDIENCE_ID,
        User      $user
    ): void
    {
        try {
            # 1. Upsert
            $mailchimp->lists->setListMember($AUDIENCE_ID, self::emailToId($user->email), [
                'email_address' => $user->email,
                'status_if_new' => 'subscribed',
                'merge_fields' => [
                    'FNAME' => $user->name,  // todo: Consider changing DB schema s.t. User stores First and Last name, instead of a combined 'name': so when we email ppl, we can say Dear '<first name>' instead of Dear '<full name>'?
                    'LNAME' => ''
                ]
            ]);

            # 2. Update tags
            $hackerStatus = $user->type === 'hacker';
            $committeeStatus = $user->type === 'committee';  // todo: add all possible user types
            $registeredStatus = $hackerStatus && !$user->application->confirmed;
            $participantStatus = $hackerStatus && $user->application->confirmed;
            $mailchimp->lists->updateListMemberTags($AUDIENCE_ID, self::emailToId($user->email), [
                "tags" => [
                    ['name' => 'hacker', 'status' => $hackerStatus ? 'active' : 'inactive'],
                    ['name' => 'committee', 'status' => $committeeStatus ? 'active' : 'inactive'],  // todo: add all possible user types
                    ['name' => 'Registered', 'status' => $registeredStatus ? 'active' : 'inactive'],  // removes 'Registered' tag if user is confirmed
                    ['name' => 'Participant', 'status' => $participantStatus ? 'active' : 'inactive']  // sets 'Participant' tag if user is confirmed
                ]
            ]);
        } catch (ClientException $e) {
            echo $e->getMessage();
            // todo: Not sure what's the general way to deal with exceptions in this codebase...
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
            'apiKey' => '3c479e02d8654680698c2624244cc715-us20',  // Test API key. Replace with your own so you can test it out.
            'server' => 'us20'
        ]);
        $AUDIENCE_ID = $mailchimp->lists->getAllLists()->lists[0]->id;

        // Todo? : add code to discover "pending" (Mailchimp terminology) users
        // ^above to-do is not applicable if we never ever let users be in the "pending" state: i.e. we always add them in the "subscribed state"

        # 2. DELETE users from Mailchimp that are not in database
        $allMailchimpIdsInDatabase = User::pluck('email')->map(function ($e) {
            return self::emailToId($e);
        })->toArray();
        $allMailchimpIdsInMailchimp = array_column($mailchimp->lists->getListMembersInfo($AUDIENCE_ID, ['members.id'])->members, 'id');
        $idsToRemove = array_diff($allMailchimpIdsInMailchimp, $allMailchimpIdsInDatabase);  // Mailchimp minus Database (in Mailchimp but not in Database) : These users should be removed from Mailchimp.
        foreach ($idsToRemove as $id) {
            $mailchimp->lists->deleteListMember($AUDIENCE_ID, $id);
        }

        # 3. UPSERT everyone else in database into Mailchimp
        $allUsers = User::select('id', 'email', 'name', 'type')->get();
        foreach ($allUsers as $user) {
            self::upsertUserToMailingList($mailchimp, $AUDIENCE_ID, $user);
        }
    }
}
