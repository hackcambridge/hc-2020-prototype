<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateApplicationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedInteger('user_id');
            $table->string("cvFilename")->default("")->nullable();
            $table->string("cvUrl")->default("")->nullable();
            $table->longText("questionResponses");
            $table->boolean("isSubmitted")->default(0);
            $table->boolean("reviewed")->default(0);
            $table->boolean("invited")->default(0);
            $table->boolean("confirmed")->default(0);
            $table->boolean("rejected")->default(0);
            $table->timestamps();
        });

        Schema::table('applications', function($table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('applications');
    }
}
