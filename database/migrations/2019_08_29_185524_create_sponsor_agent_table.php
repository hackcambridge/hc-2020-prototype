<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSponsorAgentTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sponsor_agents', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string("name")->default("");
            $table->string('email');
            $table->string('type');
            $table->string("auth0_id")->nullable();
            $table->unsignedBigInteger('sponsor_id');
            $table->timestamps();
        });

        Schema::table('sponsor_agents', function($table) {
            $table->foreign('sponsor_id')->references('id')->on('sponsors')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sponsor_agent');
    }
}
