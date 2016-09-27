---
title: 'Parent and child process management in PHP with `pcntl_fork()` and `pcntl_wait()`'
date: '2014-10-18 10:25'
taxonomy:
    category:
        - blog
    tag:
        - php
description: 'Feugiat interdum sed commodo ipsum consequat dolor nullam metus'
author: 'Jon Glick'
author_bio: 'Cras mattis consectetur purus sit amet fermentum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur blandit tempus porttitor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.'
avatar: xavatar.jpg
---

So, you need a php process that can launch other processes (background tasks, if you will) and monitor them for completion. This is a common problem but the solution in PHP isn't exactly straight-forward.  There are a number of [process control extensions](http://www.php.net/manual/en/refs.fileprocess.process.php) listed on the PHP.net website and PCNTL is a common solution.

PCNTL uses a "forking" design similar to all unix processes: every new process is a clone of its parent process. The [Basic usage example](http://www.php.net/manual/en/pcntl.example.php) on PHP.net is, indeed, complete but I found it hard to decypher at first. Overall, there were two parts of the implementation I had trouble grokking.

## Control flow of processes through the PHP file

The control flow hinges on the [`pcntl_fork()`](http://www.php.net/manual/en/function.pcntl-fork.php) function. It creates a copy of the parent process where execution is at the same place in both processes.  Its return value can mean 3 different things and serves as the identifier for which process the current execution is in.

- If the value is `-1`, there was an error starting the child process.  This is returned on the parent process.
- If the value is greater than `0`, it is the process id (`$pid`) of the child process.  This is also returned on the parent process.
- If the value is `0`, it is the child process.

I like to organize this code like this:


    function code_for_child_process() {
      // Executed in the child process.
    }
    function code_for_parent_process() {
      // Executed in the parent process.
    }
    function code_for_failed_to_launch_child_process() {
      // Executed in the parent process when forking a child didn't work.
    }

    function fork_process() {
      $pid = pcntl_fork();
      if ($pid == -1) {
        code_for_failed_to_launch_child_process();
      }
      else if ($pid) {
        code_for_parent_process();
      }
      else {
        code_for_child_process();
        exit(); // Make sure to exit.
      }
    }

This illustrates which code will be executed in which process and abstracts that away from the confusing `pcntl_fork()` return value.

Cool, now we know how to make a new process and tell what code is executed in each.


## Notifying the parent process when a child is done executing

This is accomplished with the [`pcntl_wait()`](http://www.php.net/manual/en/function.pcntl-wait.php) function that returns the `$pid` of a child process that has exited.

This function can either block execution until a `$pid` is returned or return immediately with `0` if no child process has exited since its last call.  Use `WNOHANG` as the 2nd argument to do the latter.

For the non-blocking version you can use a loop to keep polling for completed child processes. This is done with code like this on the parent process:


    function code_when_child_is_done($pid) {
      // Parent runs this when the child process, $pid, is done.
    }

    while (TRUE) {
      $pid = pcntl_wait($status, WNOHANG);
      if ($pid &gt; 0) {
        code_when_child_is_done($pid);
      }
    }

## All together now

Putting this all together gives us a parent process that can launch children and run code when the child process is finished:


    function code_for_child_process() {
      // Executed in the child process.
    }

    function code_for_failed_to_launch_child_process() {
      // Executed in the parent process when forking a child didn't work.
    }

    function code_when_child_is_done($pid) {
      // Executed in the parent process when the child process, $pid, is done.
    }

    function fork_process() {
      $pid = pcntl_fork();
      if ($pid == -1) {
        code_for_failed_to_launch_child_process();
      }
      else if ($pid == 0) {
        code_for_child_process();
        exit(); // Make sure to exit.
      }
      else {
        return $pid;
      }
    }

    // Start two child processes.
    $child_pids = array();
    $child_pids[] = fork_process();
    $child_pids[] = fork_process();

    while (TRUE) {
      $pid = pcntl_wait(-1, $status, WNOHANG);
      if ($pid &gt; 0) {
        code_when_child_is_done($pid);
      }
      sleep(1);
    }

And that's it, a bare-bones parent/child process management system in PHP.  A few things to keep in mind:

- You need to have the PCNTL extension installed on your server, which can be a pain depending on how you host.
- Forking a process can do weird things with database connections.  The most common is that you'll need to reconnect to the database after the fork in the child process.
