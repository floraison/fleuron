
N = fleuron
RUBY = ruby
VERSION != grep VERSION src/$(N).js | $(RUBY) -e "puts gets.match(/VERSION = '([\d\.]+)/)[1]"
SHA != git log -1 --format="%h"
NOW != date
COPY != grep Copyright LICENSE.txt
NORM != ls web/css/normalize*


version:
	@echo $(N) $(VERSION)
	@echo $(NORM)
v: version

pkg_plain:
	#
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
	#
	cp $(NORM) pkg/$(N)-$(VERSION).normalized.css
	echo "" >> pkg/$(N)-$(VERSION).normalized.css
	echo "/* MIT Licensed */" >> pkg/$(N)-$(VERSION).normalized.css
	echo "/* $(COPY) */" >> pkg/$(N)-$(VERSION).normalized.css
	echo "" >> pkg/$(N)-$(VERSION).normalized.css
	echo "/* from commit $(SHA) on $(NOW) */" >> pkg/$(N)-$(VERSION).normalized.css
	cat src/$(N).css >> pkg/$(N)-$(VERSION).normalized.css
	cp pkg/$(N)-$(VERSION).normalized.css pkg/$(N)-$(VERSION)-$(SHA).normalized.css
	@echo
	ls -al pkg/$(N)-$(VERSION)*
	@echo

pkg: pkg_plain

clean:
	rm -fR pkg/

serve:
	$(RUBY) -run -ehttpd web/ -p8001
s: serve


.PHONY: serve version pkg clean

