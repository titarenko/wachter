# Log

Module for logging.

Features:

* provides caller info (which function has called log method)
* color console output
* logs uncaught exceptions (with `alert` level)
* uses system bus (if provided)

# API

Notice: if argument (except error) is object, it will be `JSON.stringify`ed, otherwise, `toString`ed.

## alert([arg, arg2, arg3, ...,] [error])

Logs `arg` and error details (if any) with level `alert` (highest level) to `stderr`.
Additionally raises event `system:alert` using system bus (if provided).

## error([arg, arg2, arg3, ...,] [error])

Logs `arg` and error details (if any) with level `error` to `stderr`.

## info([arg, arg2, arg3, ...,])

Logs `arg` with level `info` to `stdout`.

## debug([arg, arg2, arg3, ...,])

Logs `arg` with level `debug` to `stdout`.

# License

BSD
