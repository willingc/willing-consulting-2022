---
title: "Security at the Seams: What’s a Software Development Manager to Do?"
description: "Economics of Cybersecurity Reflection Essay"
categories: [tech]
author: Carol Willing
date: 2015-03-02
draft: false
tags:
  - economics
  - education
  - edX
  - open source
  - security
  - community
  - learn
  - teamwork
---

I recently had the pleasure of taking a new course through edX. The course, [DelftX: EconSec101x Economics of Cybersecurity](https://www.edx.org/course/economics-cybersecurity-delftx-econsec101x), adeptly illustrates the many economic issues and behaviors that impact security in practice. I highly recommend the course to those interested in economics and security. Here's my final reflection essay from the course.
<!-- more -->
**Economics of Cybersecurity Reflection Essay**

### Security at the Seams: What’s a Software Development Manager to Do?

Discussions of security frequently come up in the Open Source Software development ecosystem. Yet, the discussions tend to mostly center around known insecurities, obstacles toward addressing those security issues, and post-vulnerability scrambles to fix issues with media exposure.

I entered this course with an expectation that my econometrics background would help me find some better measurement tools for security in the development process and some best practice methods to cost effectively implement in my development teams. As I finish up the course, measurement and metrics seem less critical than the incentives, information asymmetries, and behaviors that guide the micro-activities of software development teams.

#### Incentives

“Information systems are prone to fail when the person responsible for protecting a system is not the one who suffers when it fails”[1] Tyler Moore and Ross Anderson point out that companies’ incentives often do not align with the best interests of the greater community. Similar incentives to address security issues should be in place for individual members of a development team. Plenty of developers under pressure to get product out the door introduce security vulnerabilities or vectors for attack. Whether it is a result of a lack of time or training, developers create software that passes data unencrypted, check security keys into public GitHub repos, do not protect against XSS, fail to keep old systems current with security patches, and more. As Moore and Anderson point out, it’s important for managers and developers as “…parties in a position to fix problems have an incentive to do so.” [1]

One difficulty in providing incentives for developers is the ability to easily create meaningful metrics for measuring security and its impact. Incenting developers to use tools that reinforce best practices such as in Resources [2] and [3] would be one excellent way to align individual developer interests with the greater industry interests. Automating repetitive tasks for configuration and testing also frees the developer to do more meaningful work and helps motivate better practices and personal growth.

#### Information asymmetries

Information within teams and across teams, especially competing companies, is not freely available to all. IRC battles, long processes for decision making, overworked core developers, and workarounds that compromise best practices are all issues in open source software that present barriers to information flow between companies and contributors.

In the Linux kernel and OpenStack development projects, the developers on these teams face the choices to do what is best for the free network infrastructure versus what is best for the enterprise implementation of the project. Sometimes information that would reflect poorly on a company’s developers is slowly distributed or ignored until a fix can be merged. Also, time to market for enterprise features and releases generally take priority over security and associated developer time. In the race to market, developers do the bare minimum for security and add additional security only as market demands or insecurities are identified.

So what’s a manager or individual developer to do? Again, best practices and automating processes with development tools help. Fostering a responsive team also helps to respond to unexpected issues. Infrastructure and processes that encourage sharing of information and security vulnerabilities in a controlled manner across companies also helps. Ultimately, people and their individual actions determine when and what information is shared with teams and the public.

#### Conclusion

People are the cornerstone of improved security. Technology helps but only to the point that it doesn’t obfuscate the insecure portions of the system. Just as the study of economics includes macro and micro actions, cybersecurity will be an ongoing dance between macro issues, such as policy and liability distribution, and micro issues, incentives and information used by the software development teams.

##### Resources:

[1]: Tyler Moore and Ross Anderson. Economics and Internet Security: a Survey of Recent Analytical, Empirical
andBehavioral Research, 2011

[2]: Cybersecurity Initiative http://cybersecurity.ieee.org

[3]: OWASP https://www.owasp.org/index.php/OWASP_Proactive_Controls
