# | Documentation

### [](#)

-   [Introduction](#introduction)
-   [API Reference](#api-reference)
-   [Gami ▾](#gami)
    
    -   Instance members
    -   [#connect](#gamiconnect)
    -   [#disconnect](#gamidisconnect)
    -   [#use\_portal](#gamiuse_portal)
    -   [#create\_thread](#gamicreate_thread)
    -   [#start\_recording](#gamistart_recording)
    -   [#pause\_recording](#gamipause_recording)
    -   [#toggle\_recording](#gamitoggle_recording)
    -   [#resume\_recording](#gamiresume_recording)
    -   [#is\_recording](#gamiis_recording)
    -   [#on](#gamion)
    -   [#off](#gamioff)
    

[Need help reading this?](https://documentation.js.org/reading-documentation.html)

## Introduction

### [](#including-the-sdk)Including the SDK

To include the SDK, add a script tag like this:

```
<script defer src="https://gamilab.ch/js/sdk.js"></script>
```

### [](#initialization)Initialization

Initialize the SDK by listening for the `gami:init` event:

```
let Gami = null
window.addEventListener("gami:init", (evt) => {
    Gami = evt.detail.Gami();
});
```

When `gami:init` is fired, you MUST access `evt.detail.Gami()` to finish the initialization of the library. If you don't call the Gami method the init event will be fired again. `Gami()` returns a singleton you must use for the SDK.

### [](#install-event-handlers)Install event handlers

The SDK will fire different events.

You listen to events with the `on` method.

For example:

```
Gami.on("audio:recording", (state) => console.log(state));
```

#### Supported Events

-   `audio:recording`
    
    -   Fires on each audio status change.
    -   **Callback:** `(state: string)` where state is `idle|paused|recording`.
-   `thread:text_history`
    
    -   Fires with the complete speech-to-text history.
    -   **Callback:** `(history: string)`
-   `thread:text_current`
    
    -   Fires with the current live stream speech-to-text output.
    -   **Callback:** `(current: string)`
-   `thread:extraction_status`
    
    -   Fires when data extraction status changes.
    -   **Callback:** `(status: string)` where status is `done|running`.
-   `thread:struct_current`
    
    -   Fires with structured data matching the portal model's schema.
    -   **Callback:** `(data: object)` where object corresponds to the portal model's schema.

### [](#step‑by‑step-summary)Step‑by‑step Summary

1.  **Initialize Connection**
    
    ```
    await gami.connect();
    ```
    
2.  **Select a Public Portal**
    
    ```
    await gami.use_portal(portal_id);
    ```
    
3.  **Create or Resume a Thread**
    
    ```
    const new_thread = await gami.create_thread();
    const resumed_thread = await gami.resume_thread(thread_id);
    ```
    
4.  **Begin Recording**
    
    ```
    await gami.start_recording();
    ```
    
5.  **Control Recording**
    
    ```
    await gami.toggle_recording();
    ```
    

## API Reference

Complete API documentation for all modules

### [](#gami)Gami

Main SDK singleton

Every interaction with the Gami API uses this class as entry point

new Gami()

Instance Members

▾ connect(host)

Connects to the WebSocket server

connect(host: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)): [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>

Parameters

host `([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))` The WebSocket host URL

Returns

`[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`:

Example

\`\`\`
await gami.connect("gamilab.ch");
\`\`\`

▸ disconnect()

Disconnects from the WebSocket server

disconnect(): [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>

Returns

`[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`:

▸ use\_portal(portal\_id)

Joins a portal channel

use\_portal(portal\_id: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)): [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>

Parameters

portal\_id `([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))` The ID of the portal to join

Returns

`[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`:

Example

\`\`\`
await gami.use\_portal("portal-123");
\`\`\`

▸ create\_thread()

Creates a new thread in the current portal

create\_thread(): [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<{thread\_id: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), token: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)}>

Returns

`[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<{thread_id: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), token: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)}>`: Thread information

Throws

-   [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error): If thread creation fails

Example

\`\`\`
const thread\_info = await gami.create\_thread();
\`\`\`

▸ start\_recording()

Starts audio recording This method handles browser permissions for microphone access

start\_recording(): [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>

Returns

`[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`:

Throws

-   [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error): If recording mime type is not supported or thread is not set

Example

\`\`\`
await gami.start\_recording();
\`\`\`

▸ pause\_recording()

Pause recording

pause\_recording(): [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>

Returns

`[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`:

▸ toggle\_recording()

Toggle recording

toggle\_recording(): [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>

Returns

`[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`:

▸ resume\_recording()

Resume recording

resume\_recording(): [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>

Returns

`[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<void>`:

▸ is\_recording()

Is recording

is\_recording(): [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

Returns

`[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)`: True if recording, false otherwise

▸ on(evt, cb)

Add event handler

on(evt: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String), cb: [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function)): [Symbol](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Symbol)

Parameters

evt `([string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String))` Event name

cb `([Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function))` Callback function to execute when event is emitted

Returns

`[Symbol](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Symbol)`: Unique reference to the handler

Example

\`\`\`
const ref = gami.on("thread:update", (data) => console.log(data));
\`\`\`

▸ off(ref)

Remove event handler

off(ref: [Symbol](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Symbol)): void

Parameters

ref `([Symbol](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Symbol))` Reference returned from on() method

Returns

`void`:

Example

\`\`\`
gami.off(ref);
\`\`\`

<iframe id="flylighter-iframe" title="Flylighter" allow="clipboard-write; display-capture;" allowtransparency="true" style="
			top: 16px;
			right:16px;
			position: fixed; 
			z-index: 2147483647;
			opacity: 0;
			offset-anchor: top right;
			outline: none;
			overflow: hidden;
			pointer-events: none;
			box-sizing: border-box;
			margin: 0 !important;
			border: none;
            width: 401px;
            background: transparent;
            max-height: unset !important;
            min-width: 401px;
			color-scheme: auto;
			border-radius: 12px;
			min-width: unset !important;
		" src="chrome-extension://dlmdffmkcggiicjbfnjcnikkpahgplmd/src/pages/listener/listener.html"></iframe>


