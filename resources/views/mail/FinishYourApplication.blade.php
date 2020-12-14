@extends('mail.base')

@section('content')
    <p class="greeting">Hi %recipient.name%!</p>
    @foreach ($content as $line)
        <p>{{ $line }}</p>
    @endforeach
    <div style="margin: 2rem 0;">
        <a class="noline" href="https://hackcambridge.com/dashboard"><span class="button">Apply for Hex Cambridge →</span></a>
    </div>
    <p class="signoff">Happy Holidays,<br/>The Hex Cambridge Team</p>
@endsection
