
RUBY = ruby


serve:
	$(RUBY) -run -ehttpd web/ -p8001
s: serve


.PHONY: serve

