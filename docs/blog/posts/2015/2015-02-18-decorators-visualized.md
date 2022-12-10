---
title: "Decorators visualized"
date: 2015-02-18
tags:
- decorators
- online python tutor
- phillip guo
- python
- simplicity
- learn
- open source
---


Decorators make code more readable. When learning how decorators work, it's
easy to get confused. When teaching decorators, students often ask "but how
does it work" and "why does it work". "Magic, it just does" and "follow the
pattern of the example" could be reasonable though less than satisfying
responses.

### Online Python Tutor

Learning to use decorators can be frustrating until the learner understands
how decorators work. To build mastery, students want to visualize what the
computer is doing when using a decorator. Fortunately,  [Phillip
Guo](http://www.pgbovine.net/) has developed [Online Python
Tutor](http://pythontutor.com/) to improve the student's learning experience.

Online Python Tutor lets users enter code and interactively see what is
happening when the code executes. It breaks things down to a step by step
visual of how data moves behind the scenes when a program executes.

### Sharing and embedding visualizations

Two great features of Online
Python Tutor are the user can share live visualizations of the code and can
embed the visualizations in any web page. The emphasis on sharing and
collaboration helps teachers to easily communicate concepts to their students.

#### Let's look at a decorator example

To use the interactive demo, simply click on the 'next' and 'back' buttons to
move through the code step by step.

[Interactive decorator example](http://pythontutor.com/iframe-embed.html#code=def+make_bold(fn)%3A%0A++++return+lambda+%3A+%22%3Cb%3E%22+%2B+fn()+%2B+%22%3C/b%3E%22%0A%0Adef+make_italic(fn)%3A%0A++++return+lambda+%3A+%22%3Ci%3E%22+%2B+fn()+%2B+%22%3C/i%3E%22%0A%0A%40make_bold%0A%40make_italic%0Adef+hello()%3A%0A++return+%22hello+world%22%0A++%0AhelloHTML+%3D+hello()&origin=opt-frontend.js&cumulative=false&heapPrimitives=false&textReferences=false&py=3&rawInputLstJSON=%5B%5D&curInstr=0&codeDivWidth=350&codeDivHeight=400)

![](../images/guo_decorator.png)


### Phillip Guo's research publication

For the those that are curious, [Phillip Guo's research
paper](http://pgbovine.net/publications/Online-Python-Tutor-web-based-program-visualization_SIGCSE-2013.pdf)
*presents why and how Online Python Tutor improves learning. Thank you for
this wonderful program!*
