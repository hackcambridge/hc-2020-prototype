@extends('mail.base')

@section('content')
    <p class="greeting">Hi {{ isset($name) ? $name : "there" }}!</p>
    @foreach ($content as $line)
        <p>{{ $line }}</p>
    @endforeach
    <p class="signoff">{{ isset($signoff) ? $signoff : "All the best" }},<br/>The Hack Cambridge Team</p>
@endsection
