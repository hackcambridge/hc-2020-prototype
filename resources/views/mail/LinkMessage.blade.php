@extends('mail.base')

@section('content')
    <p class="greeting">Hi %recipient.name%!</p>
    @foreach ($content as $line)
        <p>{{ $line }}</p>
    @endforeach
    <div style="margin: 2rem 0;">
        <a class="noline" href="{{ $link }}"><span class="button">{{ $link_text }} →</span></a>
    </div>
    <p class="signoff">{{ isset($signoff) ? $signoff : "All the best" }},<br/>The Hex Cambridge Team</p>
@endsection
