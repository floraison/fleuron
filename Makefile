
N:=fleuron
RUBY:=ruby
VERSION:=$(shell grep VERSION src/fleuron.js | $(RUBY) -e "puts gets.match(/VERSION = '([\d\.]+)/)[1]")
SHA:=$(shell git log -1 --format="%h")
NOW:=$(shell date)
COPY:=$(shell grep Copyright LICENSE.txt)


version:
	@echo $(VERSION)
v: version

pkg_plain:
	mkdir -p pkg
	#
	cp src/$(N).js pkg/$(N)-$(VERSION).js
	echo "/* MIT Licensed */" >> pkg/$(N)-$(VERSION).js
	echo "/* $(COPY) */" >> pkg/$(N)-$(VERSION).js
	echo "" >> pkg/$(N)-$(VERSION).js
	echo "/* from commit $(SHA) on $(NOW) */" >> pkg/$(N)-$(VERSION).js
	cp pkg/$(N)-$(VERSION).js pkg/$(N)-$(VERSION)-$(SHA).js
	#
	cp src/$(N).css pkg/$(N)-$(VERSION).css
	echo "/* MIT Licensed */" >> pkg/$(N)-$(VERSION).css
	echo "/* $(COPY) */" >> pkg/$(N)-$(VERSION).css
	echo "" >> pkg/$(N)-$(VERSION).css
	echo "/* from commit $(SHA) on $(NOW) */" >> pkg/$(N)-$(VERSION).css
	cp pkg/$(N)-$(VERSION).css pkg/$(N)-$(VERSION)-$(SHA).css

pkg: pkg_plain

serve:
	$(RUBY) -run -ehttpd web/ -p8001
s: serve


.PHONY: serve version pkg

