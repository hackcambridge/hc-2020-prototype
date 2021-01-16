@extends('mail.base')

@section('content')
    <p class="greeting">Hi %recipient.name%!</p>
    @foreach ($content as $line)
        <p>{{ $line }}</p>
    @endforeach
    <p class="signoff">{{ isset($signoff) ? $signoff : "All the best" }},<br/>The Hex Cambridge Team</p>
@endsection
