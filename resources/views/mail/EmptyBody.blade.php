@extends('mail.base')

@section('content')
    @foreach ($html_content as $line)
        {{ $line }}
    @endforeach
@endsection
