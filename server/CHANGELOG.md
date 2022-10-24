# Changelog

> **Deprecated** → Changes are now tracked in [../CHANGELOG.md](../CHANGELOG.md)

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.12.2](https://github.com/digitalinteraction/mozfest-server/compare/v2.12.1...v2.12.2) (2022-03-14)

### Bug Fixes

- only import socket.io-client on-demand ([807cfd5](https://github.com/digitalinteraction/mozfest-server/commit/807cfd571a3728146f53efaa1e4f21fafe0cc72e))

### [2.12.1](https://github.com/digitalinteraction/mozfest-server/compare/v2.12.0...v2.12.1) (2022-03-14)

### Bug Fixes

- add hack command to test io load ([02d548b](https://github.com/digitalinteraction/mozfest-server/commit/02d548b26e348331cefdf5f0037357d04f178721))
- bad deps ([648337a](https://github.com/digitalinteraction/mozfest-server/commit/648337a1f8f6850873d16258bada13df500782a1))
- debug healthpoint ([4628229](https://github.com/digitalinteraction/mozfest-server/commit/4628229d04e5aad52bd7f2fcb0408689090dd31e))
- don't exit on socket failuer ([eff091b](https://github.com/digitalinteraction/mozfest-server/commit/eff091b87f5c948dbb823c6fb22e13ff2d1dec67))
- **hack:** ips command exits on the end of a stream ([662fe88](https://github.com/digitalinteraction/mozfest-server/commit/662fe88cefec8f35362378be401c5bd9886b43a1))
- try no redis healthcheck ([66345b0](https://github.com/digitalinteraction/mozfest-server/commit/66345b0d28c118e430b6a74276e43d58f27507eb))
- turn store healthcheck back on ([6328693](https://github.com/digitalinteraction/mozfest-server/commit/63286930559b91bb9574b75f0a4849119b14363f))

## [2.12.0](https://github.com/digitalinteraction/mozfest-server/compare/v2.11.0...v2.12.0) (2022-03-01)

### Features

- **cli:** pull themes from pretalx ([e4414a2](https://github.com/digitalinteraction/mozfest-server/commit/e4414a2d8ccd6a01b7b844acd4a0413243fd5acd))

## [2.11.0](https://github.com/digitalinteraction/mozfest-server/compare/v2.10.0...v2.11.0) (2022-02-24)

### Features

- add emergent pages config ([fec789c](https://github.com/digitalinteraction/mozfest-server/commit/fec789c3ddee96067079f7c8e9d628e6a56eed43))
- add emergent sessions content ([bb6f703](https://github.com/digitalinteraction/mozfest-server/commit/bb6f7030f08ef5597003fbb69c13f54a80c46a57))
- **cli:** add `repoPath` option to fetch-content to specify a local repo ([6321ee3](https://github.com/digitalinteraction/mozfest-server/commit/6321ee3319b6522599f547dc7ed40de75e63acae))

## [2.10.0](https://github.com/digitalinteraction/mozfest-server/compare/v2.9.6...v2.10.0) (2022-02-10)

### Features

- add misinfo-con-filters content ([ba4c49d](https://github.com/digitalinteraction/mozfest-server/commit/ba4c49d2ccae4ba51a2d4e24572b9bfad6d0d890))
- add misinfoCon page flag and make all extra flags optional ([80a2637](https://github.com/digitalinteraction/mozfest-server/commit/80a26370bc55626995b150139f2802c968fcb81e))

### Bug Fixes

- rename scrape-pretalx/tito endpoints and deprecate ([4cf2ae6](https://github.com/digitalinteraction/mozfest-server/commit/4cf2ae698327fa554ea0616de4920e6a22e905c3))

### [2.9.6](https://github.com/digitalinteraction/mozfest-server/compare/v2.9.5...v2.9.6) (2022-02-10)

### Bug Fixes

- add description error when log-visitors fails ([a3a4c51](https://github.com/digitalinteraction/mozfest-server/commit/a3a4c518665223d96f166a42640a7a4992285c72))
- add descriptive error when socket processing fails ([db5ddf9](https://github.com/digitalinteraction/mozfest-server/commit/db5ddf91c58868a6d8321492339feb5221187359))
- update deconf to better error logging ([db4e652](https://github.com/digitalinteraction/mozfest-server/commit/db4e652e606900aea7e70bc5815bf6f9592df2c8))

### [2.9.5](https://github.com/digitalinteraction/mozfest-server/compare/v2.9.4...v2.9.5) (2022-02-07)

### Bug Fixes

- update ical calendar name ([62ae364](https://github.com/digitalinteraction/mozfest-server/commit/62ae3647e063be19da833aef417f23777753d27c))

### [2.9.4](https://github.com/digitalinteraction/mozfest-server/compare/v2.9.3...v2.9.4) (2022-02-07)

### Bug Fixes

- set ical calendar name ([e24cd44](https://github.com/digitalinteraction/mozfest-server/commit/e24cd449681b39c2e5810b452dfca367d996948c))

### [2.9.3](https://github.com/digitalinteraction/mozfest-server/compare/v2.9.2...v2.9.3) (2022-01-27)

### Bug Fixes

- socket auth expires after 24h ([6545753](https://github.com/digitalinteraction/mozfest-server/commit/6545753ba3d58372707a3bbb6ea90289448fc17e))

### [2.9.2](https://github.com/digitalinteraction/mozfest-server/compare/v2.9.1...v2.9.2) (2022-01-26)

### [2.9.1](https://github.com/digitalinteraction/mozfest-server/compare/v2.9.0...v2.9.1) (2022-01-20)

### Bug Fixes

- **tito:** remove race condition when scrape finishes ([358b353](https://github.com/digitalinteraction/mozfest-server/commit/358b3531c934e31d15e058a912ce11bf856dd41d))

## [2.9.0](https://github.com/digitalinteraction/mozfest-server/compare/v2.8.1...v2.9.0) (2022-01-20)

### Features

- pull more content ([2cdf52f](https://github.com/digitalinteraction/mozfest-server/commit/2cdf52fb90e35a72192225ce57ec3740b02b5ecf))

### Bug Fixes

- **metrics:** add profile/userCalendar ([690d3e5](https://github.com/digitalinteraction/mozfest-server/commit/690d3e587e690004b56fa194911147389af1183a))

### [2.8.1](https://github.com/digitalinteraction/mozfest-server/compare/v2.8.0...v2.8.1) (2022-01-19)

### Bug Fixes

- urls are generated correctly when proxied in a subdirectories ([5676ea4](https://github.com/digitalinteraction/mozfest-server/commit/5676ea4576c820d64191ed21abf17a969f0e2d4b))

## [2.8.0](https://github.com/digitalinteraction/mozfest-server/compare/v2.7.0...v2.8.0) (2022-01-19)

### Features

- add CalendarRouter for ical/google/user-ical routes ([2a0a9bd](https://github.com/digitalinteraction/mozfest-server/commit/2a0a9bd814c47747e18c0d90fa1a4b9a1b77e83f))

## [2.7.0](https://github.com/digitalinteraction/mozfest-server/compare/v2.6.5...v2.7.0) (2022-01-17)

### Features

- add confirmed & unscheduled lint rule ([4b7cde6](https://github.com/digitalinteraction/mozfest-server/commit/4b7cde695421b6842ee9e284823dd686c86b7da9))

### [2.6.5](https://github.com/digitalinteraction/mozfest-server/compare/v2.6.4...v2.6.5) (2022-01-17)

### Bug Fixes

- **pretalx:** unset session slot when it is null\_\_null ([8076bc4](https://github.com/digitalinteraction/mozfest-server/commit/8076bc4f0115f8380de2bb31bc016eeb198eabb0))

### [2.6.4](https://github.com/digitalinteraction/mozfest-server/compare/v2.6.3...v2.6.4) (2022-01-13)

### Bug Fixes

- allow sessionType's "layout" to be set ([a704182](https://github.com/digitalinteraction/mozfest-server/commit/a704182ce16af1eae43424f876bdbea105b6c95b))

### [2.6.3](https://github.com/digitalinteraction/mozfest-server/compare/v2.6.2...v2.6.3) (2022-01-13)

### Bug Fixes

- fix crash on [@deauth](https://github.com/deauth) ([95f074f](https://github.com/digitalinteraction/mozfest-server/commit/95f074f63ec0e355811a143107eb70ca0436d562))

### [2.6.2](https://github.com/digitalinteraction/mozfest-server/compare/v2.6.1...v2.6.2) (2022-01-12)

### Bug Fixes

- **admin:** add isEnabled field to `admin.pretalxInfo` ([5aeed24](https://github.com/digitalinteraction/mozfest-server/commit/5aeed2409070b6fd66d2d8a5be1fd459c4b0fc3c))

### [2.6.1](https://github.com/digitalinteraction/mozfest-server/compare/v2.6.0...v2.6.1) (2022-01-12)

### Bug Fixes

- fix crash on socket deauth ([223f19b](https://github.com/digitalinteraction/mozfest-server/commit/223f19be95f3d6266b7a88e1845b0b741382de7e))

## [2.6.0](https://github.com/digitalinteraction/mozfest-server/compare/v2.5.4...v2.6.0) (2022-01-12)

### Features

- **admin:** add endpoints to force a pretalx scrape ([25736f8](https://github.com/digitalinteraction/mozfest-server/commit/25736f8bc6b2aeeb72ea405f08b14470382d8452))

### [2.5.4](https://github.com/digitalinteraction/mozfest-server/compare/v2.5.3...v2.5.4) (2022-01-12)

### Bug Fixes

- add missing socket auth messages ([a4ddedb](https://github.com/digitalinteraction/mozfest-server/commit/a4ddedbbea5b3f8235e642a3ffb9d21493a74f16))

### [2.5.3](https://github.com/digitalinteraction/mozfest-server/compare/v2.5.2...v2.5.3) (2022-01-11)

### Bug Fixes

- share as summary_large_image twitter cards ([b226737](https://github.com/digitalinteraction/mozfest-server/commit/b226737ec47ef9099cabc53ee575ed1154f86bbc))

### [2.5.2](https://github.com/digitalinteraction/mozfest-server/compare/v2.5.1...v2.5.2) (2022-01-11)

### Bug Fixes

- reduce tito semaphore max-lock ([165bed9](https://github.com/digitalinteraction/mozfest-server/commit/165bed9e9b2de0ad2b7f02d10ab00fd4817adb01))
- use a generic session image for sharing ([58b149f](https://github.com/digitalinteraction/mozfest-server/commit/58b149fa9e376089a6f2a1369a6a9b6e5a24eba3))

### [2.5.1](https://github.com/digitalinteraction/mozfest-server/compare/v2.5.0...v2.5.1) (2022-01-11)

### Bug Fixes

- fix session-share error and add missing twitter tags ([2acedd1](https://github.com/digitalinteraction/mozfest-server/commit/2acedd15fad458f72b01214c22dd02ed5cf039af))

## [2.5.0](https://github.com/digitalinteraction/mozfest-server/compare/v2.4.0...v2.5.0) (2022-01-11)

### Features

- add general.shareSession endpoint to provide session OpenGraph ([ae920f6](https://github.com/digitalinteraction/mozfest-server/commit/ae920f6b71641a5d8e66a1d03c6806597b0ed109))

## [2.4.0](https://github.com/digitalinteraction/mozfest-server/compare/v2.3.0...v2.4.0) (2022-01-07)

### Features

- add "help" content type ([c067a5a](https://github.com/digitalinteraction/mozfest-server/commit/c067a5a4d99fb7523117a5d08942e9776c8214b6))
- add tito command to pull releases ([ee7ab26](https://github.com/digitalinteraction/mozfest-server/commit/ee7ab268577d7f34afb73be720ee94be3e8c921b))

### Bug Fixes

- remove unused art-gallery endpoint ([e174239](https://github.com/digitalinteraction/mozfest-server/commit/e174239e06912598371745dd1612f4f5dd869d1c))

## [2.3.0](https://github.com/digitalinteraction/mozfest-server/compare/v2.2.0...v2.3.0) (2022-01-06)

### Features

- add CONTENT_REPO_BRANCH environment variable ([f08d482](https://github.com/digitalinteraction/mozfest-server/commit/f08d482d485e4fd457261faeafced4457b0f4770))
- upgrade deconf-api-toolkit ([6d7bae2](https://github.com/digitalinteraction/mozfest-server/commit/6d7bae26113048934ec79e5d8ed89d09fa5fa159))

### Bug Fixes

- fix roles not being set after a login ([3c281ac](https://github.com/digitalinteraction/mozfest-server/commit/3c281acc2664dff83960e78b468a2ac86d17092f))
- fix speaker bios not showing ([6c65407](https://github.com/digitalinteraction/mozfest-server/commit/6c654079b3c3fd123bf04de03a8830e7f6950096))

## [2.2.0](https://github.com/digitalinteraction/mozfest-server/compare/v2.1.2...v2.2.0) (2021-12-09)

### Features

- add log-visitors command ([5fda69c](https://github.com/digitalinteraction/mozfest-server/commit/5fda69ccb64a3809c3f90cfb6f16787eee024d5d))

### [2.1.2](https://github.com/digitalinteraction/mozfest-server/compare/v2.1.1...v2.1.2) (2021-12-09)

### Bug Fixes

- show arts on whats-on ([36771ad](https://github.com/digitalinteraction/mozfest-server/commit/36771adb44371c80f93cfc73be54f663c329621f))

### [2.1.1](https://github.com/digitalinteraction/mozfest-server/compare/v2.1.0...v2.1.1) (2021-12-07)

### Bug Fixes

- add "house" config ([c371e9d](https://github.com/digitalinteraction/mozfest-server/commit/c371e9dcee064efc7c9cb4fc8342bb5de7481ca8))

## [2.1.0](https://github.com/digitalinteraction/mozfest-server/compare/v2.0.0...v2.1.0) (2021-12-06)

### Features

- pull conference-over content ([6fe73f0](https://github.com/digitalinteraction/mozfest-server/commit/6fe73f08863f359061dbaa76ed0e457604e0eb14))

### Bug Fixes

- update conference config struct ([fba44ec](https://github.com/digitalinteraction/mozfest-server/commit/fba44ec9f9a2be19415021966ae1a94e6a9091d1))

## [2.0.0](https://github.com/digitalinteraction/mozfest-server/compare/v1.2.7...v2.0.0) (2021-12-03)

### Features

- v2 ([#1](https://github.com/digitalinteraction/mozfest-server/issues/1)) upgrade decon-api and add features for MozFest 22 ([0af9c4f](https://github.com/digitalinteraction/mozfest-server/commit/0af9c4fd2e2e9c689504a533624d145aa48d3456))
