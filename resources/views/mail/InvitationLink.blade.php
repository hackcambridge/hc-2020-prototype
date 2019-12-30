@extends('mail.base')

@section('content')
    <p class="greeting">Hi %recipient.name%!</p>
    @foreach ($content as $line)
        <p>{{ $line }}</p>
    @endforeach
    <div style="margin: 2rem 0;">
        <a class="noline" href="https://hackcambridge.com/dashboard/invitation"><span class="button">Your Hack Cambridge Invitation →</span></a>
    </div>
    <p class="signoff">{{ isset($signoff) ? $signoff : "All the best" }},<br/>The Hack Cambridge Team</p>
@endsection
