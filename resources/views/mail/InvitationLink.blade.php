@extends('mail.base')

@section('content')
<p class="greeting">Hi %recipient.name%,</p>
<!-- @foreach ($content as $line)
        <p>{{ $line }}</p>
    @endforeach -->
<h2>Greetings from Hex Cambridge 2021!</h2>

<img style="max-width:80%" src="{{ asset('images/invite_hacker.png') }}" alt="Confirmed Hacker!" />

<p>
    We are extremely pleased to invite you to Hex Cambridge 2021 on the 23rd-24th January 2021.
<div style="margin: 2rem 0;">
    <a class="noline" href="https://hackcambridge.com/dashboard/apply/invitation"><span class="button">Your Hex Cambridge Invitation →</span></a>
</div>
To view your invitation, you can click on the link above, or paste the following link into your browser: https://hackcambridge.com/dashboard/apply/invitation/.<br/>
Invitations expire five days after they're sent, so if you're coming let us know ASAP! Please note that we don't accept RSVPs via email.
</p>

<p>In the coming weeks, Discord channels will be set up before the event for workshops, games and many more.</p>

<p>
<h3>If you do not have a team yet</h3>
    We will organise team matching sessions days before the event for you to join others with similar interests. To make this process more efficient, please fill your profile in the dashboard by clicking the avatar at the top right and selecting <code>Profile</code>. The hackathon ideas description and tags you enter here will be visible to all other participants and when other participants search for matches in the <code>Team Match</code> window, your Discord username may appear if your keywords match their searches. Team matching will become available once all participants confirm their places. In this way, you can get in touch with other individual participants before the event starts to form a team.
</p>

<p>In the meantime, prepare yourself for the amazing 36 hours coming your way!</p>

<p>If you have any questions, do not hesitate to contact us at <a href="mailto:team@hackcambridge.com">team@hackcambridge.com</a>, or direct message any of our social media accounts. We are always here for you!</p>

<p class="signoff">{{ isset($signoff) ? $signoff : "All the best" }},<br />The Hex Cambridge Team</p>
@endsection
