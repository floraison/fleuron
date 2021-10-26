
N:=fleuron
RUBY:=ruby
VERSION:=$(shell grep VERSION src/fleuron.js | $(RUBY) -e "puts gets.match(/VERSION = '([\d\.]+)/)[1]")
SHA:=$(shell git log -1 --format="%h")
NOW:=$(shell date)


version:
	@echo $(VERSION)
v: version

pkg_plain:
	mkdir -p pkg
	cp src/$(N).js pkg/$(N)-$(VERSION).js
	echo "/* from commit $(SHA) on $(NOW) */" >> pkg/$(N)-$(VERSION).js
	cp pkg/$(N)-$(VERSION).js pkg/$(N)-$(VERSION)-$(SHA).js

pkg: pkg_plain

serve:
	$(RUBY) -run -ehttpd web/ -p8001
s: serve


.PHONY: serve version pkg

