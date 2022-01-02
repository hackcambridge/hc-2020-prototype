<?php
namespace App\Traits;

use Illuminate\Support\Str;
use Ramsey\Uuid\Exception\UnsatisfiedDependencyException;

trait Uuid
{
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            try {
                $model->id = (string) Str::uuid(); // generate uuid
                // Change id with your primary key
            } catch (UnsatisfiedDependencyException $e) {
                abort(500, $e->getMessage());
            }
        });
    }
}
