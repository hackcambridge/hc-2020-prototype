<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->string('sub')->unique();
            $table->string('email')->unique();
            $table->string('name');
//            $table->string('first_name');
//            $table->string('last_name');
//            $table->string('level_of_study');
//            $table->string('major');
//            $table->string('shirt_size');
//            $table->string('dietary_restrictions');
//            $table->string('special_needs');
//            $table->string('date_of_birth');
//            $table->string('gender');
//            $table->string('school');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
