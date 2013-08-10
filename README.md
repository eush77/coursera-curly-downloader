Coursera: Unwatched Resources
=============================
This Chrome extension activates on Coursera lecture pages only.

In a click, it scans through the list and generates Curl configuration file which enables fast batch download of unwatched resources available. Config opens in a new tab ready to be copied.

## Using with Curl
Configuration file includes required authentication cookie and can be launched either way:

    cat >config
    curl --config config

```
cat |curl --config -
```
