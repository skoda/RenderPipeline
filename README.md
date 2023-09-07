# RenderPipeline

Real-time, fully software based 3D rendering pipeline. Using no external libraries beyond what's native to JS in browsers (a few Math functions and DOM objects), render-pipeline can render triangle based 3D primitives directly to pixels in an HTML Canvas element. More details available in the [about section of the demo](https://chuckskoda.com/render-pipeline/?about).

## Demo

There is a simple html/css/js example project in this repository. It should work on any updated modern browser (some CSS and ES language features are relatively recent), but in my experience, performance is best in the latest Safari on Apple Silicon hardware. There is a hosted version where you can [view the demo](https://chuckskoda.com/render-pipeline/), which I try to keep it updated with the latest changes in this repository.

## What should I use this for?

You probably shouldn't. This has largely been an exercise for me in trying new technologies, refreshing my knowledge and understanding of 3D graphics, and seeing what performance can be squeezed out of current JavaScript engines on the open web.

I'm happy to hear about any interests people have in this project though, I can be reached at [@skoda on mastodon.social](https://mastodon.social/@skoda).

## Have you ever considered...?

I have a list of things I'd like to do, from more experimenting on performance or code design, to additional features, and major changes to the APIs. Some examples of things I'm considering for the future include:

- Debug metrics. Would love to be able to track timing for critical stages, and confidently compare performance characteristics when making changes. But also, without significantly slowing down the core path, or harming code clarity.
- Test performance of alternate implementations of math types and functions.
- Some file type import to enable rendering something more interesting than geometry that's easily constructed programatically. STL files maybe, or something more complicated like USD?
- Flexible vertex types, and programmable "shaders". Basically a full V2 with a more modern API for pushing geometry. The original version was built around a fixed function pipeline which was still largely the basis for most real time rendering during my education and early career.
- Build with something else? Possibly do a total rewrite in a lower level language with WebAssembly as a build target. Perhaps something new (to me, like golang or rust) to continue using this project as a learning experience?

## Thanks for stopping by!

I have no idea why you're here, but thanks for taking an interest. Hope you have a great day!
