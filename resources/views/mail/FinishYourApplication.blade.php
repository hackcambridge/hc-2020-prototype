@extends('mail.base')

@section('content')
    <p class="greeting">Hi {{ isset($name) ? $name : "there" }}!</p>
    @foreach ($content as $line)
        <p>{{ $line }}</p>
    @endforeach
    <div style="margin: 2rem 0;">
        <a class="noline" href="https://hackcambridge.com/dashboard"><span class="button">Apply for Hack Cambridge →</span></a>
    </div>
    <p class="signoff">Merry Christmas,<br/>The Hack Cambridge Team</p>
@endsection
