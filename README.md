# wachter

Watchdog for your app. Provides API for logging and shutting down on certain condition.

Features:

* provides caller info (which function has called log method)
* colored console output
* logs uncaught exceptions (with `alert` level)
* provides methods to shut down app on uncaught exception or exceeding memory limit

# API

Notice: if argument (except error) is object, it will be `JSON.stringify`ed, otherwise, `toString`ed.

## alert(arg, arg2, arg3, ..., error)

Logs `arg` and error details (if any) with level `alert` (highest level) to `stderr`.

## error(arg, arg2, arg3, ..., error)

Logs `arg` and error details (if any) with level `error` to `stderr`.

## info(arg, arg2, arg3, ...)

Logs `arg` with level `info` to `stdout`.

## debug(arg, arg2, arg3, ...)

Logs `arg` with level `debug` to `stdout`.

## exitWhenGotUncaughtException()

Shuts down app on uncaught exception.

## exitWhenExceededMemoryLimit(limit)

Shuts down app when it has consumed more than `limit` bytes.

## exit()

Shuts down app (with code 75 which means 'temporal failure').

# License

BSD
