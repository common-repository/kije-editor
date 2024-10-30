(function (root, factory) {
	root.KijeEditor = factory
}(this, function () {
	var kijeEditor;

	function KijeEditor() {
		return this.init();
	}
	KijeEditor.extensions = {};
	KijeEditor.tooltipCount = 0;
	KijeEditor.prevTooltip;
	KijeEditor.currentTheme = false;
	KijeEditor.themeCount = 0;
	KijeEditor.selectType;
	KijeEditor.lastKeyCode;
	(function () {
		var Events = {
			attachDOMEvent: function (target, event, listener, useCapture) {
				target.addEventListener(event, listener, useCapture);
			}
		}
		KijeEditor.events = Events;
	})();

	(function () {
		var Buttons = {
			'bold': {
				name: 'bold',
				action: 'bold',
				aria: 'bold',
				tagNames: ['b', 'strong'],
				style: {
					prop: 'font-weight',
					value: '700|bold'
				}
			},
			'italic': {
				name: 'italic',
				action: 'italic',
				aria: 'italic',
				tagNames: ['i', 'em'],
				style: {
					prop: 'font-style',
					value: 'italic'
				}
			},
	        'h2': {
	        	name: 'h2',
	        	action: 'h2',
	        	aria: 'header type two',
	        	tagNames: ['h2']
	        },
	        'h3': {
	        	name: 'h3',
	        	action: 'h3',
	        	aria: 'header type three',
	        	tagNames: ['h3']
	        },
	        'blockquote': {
	        	name: 'blockquote',
	        	action: 'blockquote',
	        	aria: 'blockquote',
	        	tagNames: ['blockquote']
	        }
		}
		KijeEditor.extensions.buttons = Buttons;
	})();

	(function () {
		var Util = {
			showToolbar: function () {
				if (KijeEditor.toolbar.className.indexOf('active') == -1) KijeEditor.toolbar.className = KijeEditor.toolbar.className + ' active';
			},
			hideToolbar: function () {
				if (KijeEditor.toolbar.className.indexOf('active') != -1) KijeEditor.toolbar.className = KijeEditor.toolbar.className.replace('active', '');
				KijeEditor.tooltipCount = 0;
				KijeEditor.prevTooltip = 0;
				KijeEditor.util.removeAllTooltipClass(KijeEditor.toolbar.firstChild.children);
			},
			positionToolbar: function (e, doc) {
				if (!doc && e.keyCode === 18) return false;
				doc = KijeEditor.doc;
				this.selection = doc.getSelection();
				var tinyMce = doc.getElementById('tinymce');
				var range = this.selection.getRangeAt(0);

				var toolbar = KijeEditor.toolbar;
				var diffTop = -10;

				var boundary = range.getBoundingClientRect();
				var containerWidth = window.innerWidth,

				toolbarElement = toolbar,
				toolbarHeight = toolbar.offsetHeight,
				toolbarWidth = toolbar.offsetWidth,
				halfOffsetWidth = toolbarWidth / 2,
				buttonHeight = 50,
				defaultLeft = 0 - halfOffsetWidth,
				elementsContainer = tinyMce.body,
				elementsContainerAbsolute = false,
				positions = {},
				relativeBoundary = {},
				middleBoundary, elementsContainerBoundary;


				if (elementsContainerAbsolute) {
					elementsContainerBoundary = elementsContainer.getBoundingClientRect();
					['top', 'left'].forEach(function (key) {
						relativeBoundary[key] = boundary[key] - elementsContainerBoundary[key];
					});

					relativeBoundary.width = boundary.width;
					relativeBoundary.height = boundary.height;
					boundary = relativeBoundary;

					containerWidth = elementsContainerBoundary.width;
					positions.top = elementsContainer.scrollTop;
				}else{
					positions.top = 0;
				}

				middleBoundary = boundary.left + boundary.width / 2;
				positions.top += boundary.top - toolbarHeight;


				toolbarElement.style.top = positions.top + 'px';

				if (boundary.top < buttonHeight) { // over
					positions.top += buttonHeight + boundary.height - diffTop;

					if (toolbarElement.className.indexOf('ked-toolbar-arrow-over')==-1) {
						if (toolbarElement.className.indexOf('ked-toolbar-arrow-under')!=-1) toolbarElement.className = toolbarElement.className.replace('ked-toolbar-arrow-under', '');
						toolbarElement.className = toolbarElement.className + ' ked-toolbar-arrow-over';
					}
				}else{
					positions.top += diffTop;

					if (toolbarElement.className.indexOf('ked-toolbar-arrow-under')==-1) {
						if (toolbarElement.className.indexOf('ked-toolbar-arrow-over')!=-1) toolbarElement.className = toolbarElement.className.replace('ked-toolbar-arrow-over', '');
						toolbarElement.className = toolbarElement.className + ' ked-toolbar-arrow-under';
					}
				}

				if (middleBoundary < halfOffsetWidth) {
					positions.left = defaultLeft + halfOffsetWidth;
					positions.right = 'initial';
				}else if ((containerWidth - middleBoundary) < halfOffsetWidth) {
					positions.left = 'auto';
					positions.right = 0;
				}else{
					positions.left = defaultLeft + middleBoundary;
					positions.right = 'initial';
				}
				['top', 'left', 'right'].forEach(function (key) {
					toolbarElement.style[key] = positions[key] + (isNaN(positions[key]) ? '' : 'px');
				});
			},
			getCommandState: function (doc) {
				var toolbarUl = KijeEditor.toolbar.firstChild.children;
				if (KijeEditor.doc.queryCommandState('bold')) {
					toolbarUl[0].className = 'is-active';
				}else{
					toolbarUl[0].className = '';
				}
				if (KijeEditor.doc.queryCommandState('italic')) {
					toolbarUl[1].className = 'is-active';
				}else{
					toolbarUl[1].className = '';
				}
			},
			keyboardModify: function (modifyCount, sel, endNode, endOffset, backwards) {
				if (modifyCount === 0) {
					if (backwards) {
						sel.modify('move', 'backward', 'character');
						sel.modify('move', 'forward', 'word');
						sel.modify('extend', 'backward', 'word');
					}else{
						sel.modify('move', 'forward', 'character');
						sel.modify('move', 'backward', 'word');
						sel.modify('extend' ,'forward' ,'word');
					}
				}else if (modifyCount === 1) {
					if (backwards) {
						sel.modify('move', 'forward', 'word');
						sel.modify('move', 'forward', 'word');
						sel.extend(endNode, endOffset);
						sel.modify('extend', 'backward', 'word');
					}else{
						sel.modify('move', 'forward', 'word');
						sel.extend(endNode, endOffset);
						sel.modify('extend', 'backward', 'word');
						sel.modify('extend', 'backward', 'word');
					}
				}
				return endNode;
			},
			keyboardUpModify: function (sel, endNode, endOffset, backwards) {
				if (backwards) {
					sel.modify('move', 'backward', 'character');
					sel.modify('move', 'forward', 'word');
					sel.extend(endNode, endOffset);
					sel.modify('extend', 'forward', 'character');
					sel.modify('extend', 'backward', 'word');
				}else{
					sel.modify('move', 'forward', 'character');
					sel.modify('move', 'backward', 'word');
					sel.extend(endNode, endOffset);
					sel.modify('extend', 'backward', 'character');
					sel.modify('extend', 'forward', 'word');
				}
				return endNode;
			},
			keyboardSelector: function (key, rightClick) {
				var doc = KijeEditor.doc;
				var sel = doc.getSelection(), range;
				if (key === 'ctrl') {
					KijeEditor.selectType = 'ctrl';
					this.onSelectMode();
					range = doc.createRange();
					range.setStart(sel.anchorNode, sel.anchorOffset);
					range.setEnd(sel.focusNode, sel.focusOffset);
					var backwards = range.collapsed;
					range.detach();
					var endNode = sel.focusNode, endOffset = sel.focusOffset;

					if (modifyCount === 0) {
						this.keyboardModify(modifyCount, sel, endNode, endOffset, backwards);
						lastNode = range.startContainer;
						lastPos = range.startOffset;
						KijeEditor.extensions.lastCaretPosition = lastPos;
						KijeEditor.extensions.lastAnchorNode = lastNode;
						if (!rightClick) {
							modifyCount++;
						}
					}else if (modifyCount === 1) {
						this.keyboardModify(modifyCount, sel, endNode, endOffset, backwards);
						modifyCount++;
					}else if (modifyCount === 2) {
						var sel, range;
						sel = doc.getSelection();
						range = sel.getRangeAt(0);
						range.setStart(lastNode, lastPos);
						range.setEnd(lastNode, lastPos);
						modifyCount = 0;
						this.modifyDeselect();
					}
				}else if (key === 'shift') {
					KijeEditor.selectType = 'shift';
					this.offSelectMode();
					range = doc.createRange();
					range.setStart(sel.anchorNode, sel.anchorOffset);
					range.setEnd(sel.focusNode, sel.focusOffset);

					if (modifyCount === 0) {
						lastNode = range.startContainer;
						lastPos = sel.focusOffset;
						KijeEditor.extensions.lastCaretPosition = lastPos;
						KijeEditor.extensions.lastAnchorNode = lastNode;
					}

					var backwards = range.collapsed;
					range.detach();
					var endNode = sel.focusNode, endOffset = sel.focusOffset;
					sel.collapse(sel.anchorNode, sel.anchorOffset);
					this.keyboardUpModify(sel, endNode, endOffset, backwards);
					modifyCount++;
				}
			},
			modifyDeselect: function (e) {
				if (e) {
					if (e.keyCode === 18) {
						return false;
					}
					if (!KijeEditor.doc.getSelection().isCollapsed) { // block deselect for select mode
						if (e.keyCode === 37 || e.keyCode === 39) {
							if (KijeEditor.selectType === 'ctrl') {
								modifyCount = 0;
								return false;
							}
						}
					}
				}
				modifyCount = 0;
				KijeEditor.util.offSelectMode();
				KijeEditor.util.hideToolbar();
			},
			isBlockContainer: function (element) {
				return element && element.nodeType !== 3 && KijeEditor.util.blockContainerElementNames.indexOf(element.nodeName.toLowerCase()) !== -1;
			},
			getSelection: function (doc) {
				var node = doc.getSelection().anchorNode,
				startNode = (node && node.nodeType === 3 ? node.parentNode : node);
				return startNode;
			},
			getTopBlockContainer: function (element) {
				var topBlock = KijeEditor.util.isBlockContainer(element) ? element : false;
				return topBlock;
			},
			unwrap: function (element) {
				var el = element;
				var parent = el.parentNode;
				while (el.firstChild) parent.insertBefore(el.firstChild, el);
				parent.removeChild(el);
			},
			blockContainerElementNames: [
	            'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'ul', 'li', 'ol',
	            'address', 'article', 'aside', 'audio', 'canvas', 'dd', 'dl', 'dt', 'fieldset',
	            'figcaption', 'figure', 'footer', 'form', 'header', 'hgroup', 'main', 'nav',
	            'noscript', 'output', 'section', 'video',
	            'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'
			],
			removePreviousTooltipClass: function () {
				if (KijeEditor.prevTooltip) {
					KijeEditor.prevTooltip.className = '';
					this.docExecAltCommand(KijeEditor.prevTooltip, 'from prev');
				}
			},
			removeAllTooltipClass: function (ul) {
				for (var i=0; i <= ul.length; i++){
					if (ul[i] && ul[i].className.indexOf('is-active') != -1) {
						ul[i].className = '';
					}
				}
			},
			docExecRemoveFormat: function (doc) {
				doc.execCommand('removeFormat', false, true);
			},
			docExecAltCommand: function (tooltip) {
				var command = tooltip.firstChild.getAttribute('data-action');
				if (command === 'h2' || command === 'h3' || command === 'blockquote') {
					this.docExecAltCommandFormatBlock(command);
					KijeEditor.util.applyCurrentTheme();
					return false;
				}
				KijeEditor.doc.execCommand(command, false, true);
				KijeEditor.util.applyCurrentTheme();
			},

			docExecAltCommandFormatBlock: function (command) {
				var doc, blockContainer;
				doc = KijeEditor.doc;
				KijeEditor.util.docExecRemoveFormat(doc);
				blockContainer = KijeEditor.util.getTopBlockContainer(KijeEditor.util.getSelection(doc));
				KijeEditor.util.docExecRemoveFormat(doc);
	            if (command === 'blockquote') {
	                if (blockContainer && blockContainer.parentNode.nodeName.toLowerCase() === 'blockquote') {
	                	KijeEditor.util.unwrap(blockContainer.parentNode);
	                	if (KijeEditor.browser === 'Chrome') KijeEditor.util.hideToolbar();
	                	return false;
	                }else{
						if (KijeEditor.browser === 'Chrome') {
                			var p = blockContainer.cloneNode(true);
                			doc.execCommand('formatBlock', false, command);
                			var blockquote = KijeEditor.doc.getSelection().getRangeAt(0).startContainer.parentNode;
                			blockquote.innerHTML = p.outerHTML;

                			var selection = KijeEditor.doc.getSelection();
                			var range = KijeEditor.doc.createRange();
                			range.selectNode(blockquote);
                			selection.removeAllRanges();
                			selection.addRange(range);
                			return;
                		}
	                }
	            }
	            if (blockContainer && command === blockContainer.nodeName.toLowerCase()) {
	                command = 'p';
	            }
				doc.execCommand('formatBlock', false, command);
				KijeEditor.util.applyCurrentTheme();
			},
			applyCurrentTheme: function () {
				var fragments = KijeEditor.doc.body.children;
				var style = KijeEditor.currentTheme;
				var self = this;
				var nodes = Array.prototype.slice.call(fragments);
				nodes.forEach(function (frag) {
					if (frag && frag.nodeType === 1) {
						var tagName = frag.nodeName;
						if (tagName === 'H2' && style.h2) {
							frag.setAttribute('style', style.h2);
							frag.className = style.name;
						}else if (tagName === 'H3' && style.h3) {
							frag.setAttribute('style', style.h3);
							frag.className = style.name;
						}else if (tagName === 'P' && style.p) {
							frag.setAttribute('style', style.p);
							frag.className = style.name;
						}else if (tagName === 'BLOCKQUOTE') {
							frag.setAttribute('style', style.blockquote);
							frag.className = style.name;
							if (style.name == 'parsley') {
								if (frag.firstChild.lastChild && frag.firstChild.lastChild.nodeName == 'BR') frag.firstChild.lastChild.remove();
							}
						}
					}
				});
			},
			unselect: function () {
				var position, node, selection, range;
				position = KijeEditor.extensions.lastCaretPosition;
				node = KijeEditor.extensions.lastAnchorNode;
				selection = KijeEditor.doc.getSelection();
				range = selection.getRangeAt(0);
				range.setStart(node, position);
				range.setEnd(node, position);
				this.offSelectMode();
			},
			onSelectMode: function () {
				if (KijeEditor.extensions.editable.className.indexOf('ked-select-mode')==-1) {
					KijeEditor.extensions.editable.className = KijeEditor.extensions.editable.className + ' ked-select-mode';
				}
			},
			offSelectMode: function () {
				if (KijeEditor.extensions.editable.className.indexOf('ked-select-mode')!=-1) {
					KijeEditor.extensions.editable.className = KijeEditor.extensions.editable.className.replace('ked-select-mode', '');
				}
			}
		}

		KijeEditor.util = Util;
	})();

	(function () {
		function editableSelectionMove(e) {
			if (!KijeEditor.doc.getSelection().isCollapsed && KijeEditor.selectType === 'ctrl') {
				var sel = KijeEditor.doc.getSelection();
				if (e.keyCode === 37 || e.keyCode === 39) {
					if (e.keyCode === 37) {
						e.preventDefault();
						sel.modify('move', 'backward', 'word');
						sel.modify('move', 'forward', 'word');
						KijeEditor.util.keyboardSelector('ctrl');
					}else if (e.keyCode === 39) {
						e.preventDefault();
						sel.modify('move', 'backward', 'character');
						sel.modify('move', 'forward', 'word');
						sel.modify('move', 'forward', 'word');
						KijeEditor.util.keyboardSelector('ctrl');
					}
					KijeEditor.tooltipCount = 0;
					KijeEditor.prevTooltip = 0;
					KijeEditor.util.removeAllTooltipClass(KijeEditor.toolbar.firstChild.children);
				}
			}
			KijeEditor.lastKeyCode = e.keyCode;
		}
		function editableEscUnselect(e) {
			var isCollapsed = KijeEditor.doc.getSelection().isCollapsed;
			e = e || window.event;
			if (!isCollapsed && e.keyCode === 27) {
				KijeEditor.util.unselect();
			}
		}
		function themePrevButtonClick(e) {
			themeTooltipAnimator('prev');
		}
		function themeNextButtonClick(e) {
			themeTooltipAnimator('next');
		}
		function themeTooltipAnimator(direction) {
			var count = KijeEditor.themeCount;
			var prevCount = count;
			if (direction === 'prev') {
				if (count === 0) {
					count = KijeEditor.extensions.themeLength;
				}else{
					count--;
				}
			}else{
				if (count === KijeEditor.extensions.themeLength) {
					count = 0;
				}else{
					count++;
				}
			}
			KijeEditor.themeCount = count;
			var themes = Array.prototype.slice.call(KijeEditor.themeToolbar.firstChild.children);
			themes.forEach(function (element,index) {
				if (prevCount == index) {
					element.className = element.className.replace('is-visible', '');
				}
				if (count == index) {
					element.className = element.className + ' is-visible';
				}
			});
		}

		function detectEnterkeyForCurrentTheme(e) {
			if (e.keyCode === 13) {
				KijeEditor.util.applyCurrentTheme();
			}
		}
		function themeToolbarApply() {
			var themes = {
				'default': {
					name: 'none',
					h2: 'none',
					h3: 'none',
					p: 'none',
					blockquote: 'none',
					blockquoteP: 'none',
					blockquoteBefore: 'none',
					blockquoteAfter: 'none'
				},
				'github': {
					name: 'github',
					h2: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; padding-bottom: 0.3em; font-size: 1.5em; border-bottom: 1px solid #eaecef; color: #24292e;',
					h3: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; font-size: 1.25em; color: #24292e;',
					p: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; font-size: 16px; line-height: 1.5; word-wrap: break-word;',
					blockquote: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; display: block; margin: 0; margin-bottom: 16px; padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; font-size: 16px;',
					blockquoteP: false,
					blockquoteBefore: false,
					blockquoteAfter: false
				},
				'elizabeth': {
					name: 'elizabeth',
					h2: 'color: #000000; font-size: 32px; font-family: "Open Sans"; font-weight: 400; font-style: normal; line-height: 1.4em;',
					h3: 'color: #000000; font-size: 19px; font-weight: 400; margin-bottom: 14px; font-family: "Open Sans"; font-style: normal;',
					p: 'line-height: 1.7; font-size: 16px; font-family: "Lora", sans-serif; font-weight: 400; font-style: normal;',
					blockquote: 'font-family: "Lora"; font-weight: 400; font-style: normal; padding: 40px 12px 20px 12px; margin: 30px 0px 30px 0; border: 0; font-size: 23px; line-height: 36px; text-align: center; position: relative; color: #888;',
					blockquoteP: 'line-height: 1.7; color: #444444; margin-bottom: 20px; font-size: 20px !important; font-style: italic; text-align: center;',
					blockquoteBefore: 'content: "\f10d"; font-family: FontAwesome; font-size: 120px; line-height: 20px; font-style: normal; color: #ddd; text-align: left; width: 100%; float: left;',
					blockquoteAfter: false
				},
				'ahead': {
					name: 'ahead',
					h2: 'font-family: Montserrat; font-weight: 600; font-style: normal; color: #222; font-size: 210% !important; margin: 20px 0 18px 0; line-height: 1.4 !important;',
					h3: 'font-family: Montserrat; line-height: 28px; font-weight: 600; font-style: normal; color: #222; font-size: 150% !important; margin: 20px 0 18px 0; line-height: 1.4 !important;',
					p: 'margin: 5px 0 20px 0; font-family: "Libre Franklin"; line-height: 28px; font-weight: 400; font-style: normal; color: #494949; font-size: 14px;',
					blockquote: 'border-left: 4px solid #ddd; padding: 0 40px !important; margin: 25px 30px 25px 30px; line-height: 2.3em !important; letter-spacing: 0; font-size: 16px !important; font-weight: 400 !important; font-family: Montserrat;',
					blockquoteP: false,
					blockquoteBefore: false,
					blockquoteAfter: false
				},
				'parsley': {
					name: 'parsley',
					h2: 'font-size: 1.5rem; font-family: "Montserrat",sans-serif; font-weight: 400; line-height: 1.1; color: #111;',
					h3: 'font-size: 1.3rem; font-family: "Montserrat",sans-serif; font-weight: 400; line-height: 1.1; color: #111;',
					p: 'font-family: "PT Serif",serif; font-size: 1rem; font-weight: normal; line-height: 1.75; color: #515151;',
					blockquote: 'font-family: "PT Serif",serif; font-size: 1rem; font-weight: normal; line-height: 1.75; color: #515151;',
					blockquoteP: 'font-style: italic; font-size: 1.25em; line-height: 1.5;',
					blockquoteBefore: "content: '\201c';",
					blockquoteAfter: "content: '\201d';"
				},
				'fashion': {
					name: 'fashion',
					h2: 'font-size: 32px; line-height: 1.2em; font-family: Muli; font-weight: 400; font-style: normal; color: black;',
					h3: 'font-size: 28px; line-height: 1.2em; font-family: Muli; font-weight: 400; font-style: normal; color: black;',
					p: 'font-family: ABeeZee; font-weight: 400; font-style: normal; color: #444; line-height: 28px; font-size: 18px;',
					blockquote: 'font-family: ABeeZee; font-weight: 400; font-style: normal; color: #515151; font-size: 32px; line-height: 1.3em;',
					blockquoteP: 'display: inline;',
					blockquoteBefore  : 'content: "\f10d"; font-size: 0.8em; margin-right: 0.5em; font-family: FontAwesome;',
					blockquoteAfter: 'content: "\f10e"; font-size: 0.8em; margin-left: 0.5em; font-family: FontAwesome;'
				}
			}
			var count = KijeEditor.themeCount;
			switch(count) {
				case 0: KijeEditor.currentTheme = themes['default'];
				break;
				case 1: KijeEditor.currentTheme = themes['github'];
				break;
				case 2: KijeEditor.currentTheme = themes['elizabeth'];;
				break;
				case 3: KijeEditor.currentTheme = themes['ahead'];
				break;
				case 4: KijeEditor.currentTheme = themes['parsley'];;
				break;
				case 5: KijeEditor.currentTheme = themes['fashion'];;
				break;
			}
			KijeEditor.util.applyCurrentTheme();
		}
		function themeToolbarClick(e) {
			if (e.target && e.target.nodeName === 'SPAN') {
				themeToolbarApply();
				return false;
			}
		}
		function hideToolbarBlocker(e) {
			if (e.target && e.target.nodeName == 'DIV' && e.target.id == 'edit-slug-box' || e.target.id == 'wp-content-editor-tools' || e.target.id == 'poststuff' || e.target.id == 'normal-sortables') {
				KijeEditor.util.hideToolbar();
			}
		}

		function switchTooltip(e) {
			if (e.keyCode === 18) {
				if ( !KijeEditor.doc.getSelection().isCollapsed ) {
					var tooltipUl = KijeEditor.toolbar.firstChild.children;
					if (KijeEditor.tooltipCount === 5) {
						resetTooltip(tooltipUl);
					}else{
						addTooltipClass(tooltipUl[KijeEditor.tooltipCount]);
						KijeEditor.tooltipCount++;
					}
				}
			}
		}
		function addTooltipClass(tooltip) {
			KijeEditor.util.removePreviousTooltipClass();
			tooltip.className = 'is-active';
			KijeEditor.util.docExecAltCommand(tooltip);
			KijeEditor.prevTooltip = tooltip;
		}
		function resetTooltip() {
			KijeEditor.util.hideToolbar();
			if (KijeEditor.doc.getSelection().anchorNode.nodeName === 'BLOCKQUOTE') {
				var focusNode = KijeEditor.doc.getSelection().anchorNode.firstChild;
				var target = KijeEditor.util.getTopBlockContainer(focusNode.parentNode);
			}else{
				var focusNode = KijeEditor.doc.getSelection().anchorNode.parentNode;
				var target = KijeEditor.util.getTopBlockContainer(focusNode.parentNode);
			}

			if (target && target.nodeName === 'BLOCKQUOTE') {
				KijeEditor.util.unwrap(target);
			}
		}

		function showThemeToolbar(e) {
			if (e.rangeParent && e.rangeParent.nodeType == Node.TEXT_NODE) return false;
			if (KijeEditor.themeToolbar.className.indexOf('is-on')==-1) {
				KijeEditor.themeToolbar.className = KijeEditor.themeToolbar.className + ' is-on';
			}
		}
		function hideThemeToolbar(e) {
			if (KijeEditor.themeToolbar.className.indexOf('is-on')!=-1){
				KijeEditor.themeToolbar.className = KijeEditor.themeToolbar.className.replace('is-on','');
			}
		}
		function editableCtrlModify(e) {
			if (e.keyCode === 17) {
				KijeEditor.util.keyboardSelector('ctrl');
			}else{
				if (!e.shiftKey) {
					KijeEditor.util.modifyDeselect(e);
				}
			}
		}
		function editableShiftModify(e) {
			var doc = KijeEditor.doc;
			var sel; sel = doc.getSelection();
			if (e.keyCode === 16 && !sel.isCollapsed) {
				KijeEditor.util.keyboardSelector('shift');
			}
			if (!sel.isCollapsed) {
				KijeEditor.util.showToolbar();
				KijeEditor.util.positionToolbar(doc);
				KijeEditor.util.getCommandState(doc);
			}
		}
		function editableClickDeselect(e) {
			var sel, sel = KijeEditor.doc.getSelection();
			if (sel.isCollapsed) KijeEditor.util.modifyDeselect();
		}
		function editableRightClick(e) {
			var sel = KijeEditor.doc.getSelection();
			e.preventDefault();
			KijeEditor.util.keyboardSelector('ctrl', true);
			if (sel.anchorNode.nodeType === 3) {
				KijeEditor.util.showToolbar();
				KijeEditor.util.positionToolbar(KijeEditor.doc);
				KijeEditor.util.getCommandState(KijeEditor.doc);
			}
		}
		function editableMouseUp(e) {
			var sel; sel = KijeEditor.doc.getSelection();
			if (!sel.isCollapsed && e.button === 0) {
				KijeEditor.util.keyboardSelector('shift');
				KijeEditor.util.showToolbar();
				KijeEditor.util.positionToolbar(KijeEditor.doc);
				KijeEditor.util.getCommandState(KijeEditor.doc);
			}
		}
		function toolbarExecCommand(e) {
			var command = e.target.getAttribute('data-action');
			if (command === 'h2' || command === 'h3' || command === 'blockquote') {
				if (command === 'blockquote') {
					KijeEditor.util.hideToolbar();
				}
				execFormatBlock(command);
			}else{
				KijeEditor.doc.execCommand(command, false, true)
				KijeEditor.util.getCommandState(KijeEditor.doc);
				KijeEditor.util.applyCurrentTheme();
			}
		}
		function execFormatBlock(command) {
			var doc, blockContainer;
			doc = KijeEditor.doc;
			KijeEditor.util.docExecRemoveFormat(doc);
			KijeEditor.util.getSelection(doc)
			blockContainer = KijeEditor.util.getTopBlockContainer(KijeEditor.util.getSelection(doc));
            if (command === 'blockquote') { 
                if (blockContainer && blockContainer.parentNode.nodeName.toLowerCase() === 'blockquote') {
                	KijeEditor.util.unwrap(blockContainer.parentNode);
                	KijeEditor.util.applyCurrentTheme();
                	return false;
                }else if (blockContainer && blockContainer.nodeName !== 'blockquote' && command === 'blockquote'){
                	if (KijeEditor.browser === 'Chrome') {
                		var newNode = blockContainer.cloneNode(true);
                		doc.execCommand('formatBlock', false, command);
                		var target = KijeEditor.doc.getSelection().getRangeAt(0).startContainer.parentNode;
                		target.innerHTML = newNode.outerHTML;
                		KijeEditor.util.applyCurrentTheme();
                		return;
                	}
                	KijeEditor.util.applyCurrentTheme();
                	return doc.execCommand('formatBlock', false, command);
                }
            }
            if (blockContainer && command === blockContainer.nodeName.toLowerCase()) {
                command = 'p';
            }
			doc.execCommand('formatBlock', false, command);
			KijeEditor.util.applyCurrentTheme();
		}
		var Setup = {
			checkDomReady: function () {
				var self = this, checkDomReady;
				checkDomReady = setInterval(function () {
					if (document.readyState !== 'complete') return;
					clearInterval(checkDomReady);
					return self.checkCrossBrowser();
				}, 100);			
			},
			checkCrossBrowser: function () {
				var isFirefox = typeof InstallTrigger !== 'undefined';
				var isChrome = !!window.chrome && !!window.chrome.webstore;
				if (isFirefox) KijeEditor.browser = 'Firefox';
				if (isChrome) KijeEditor.browser = 'Chrome';
				return this.getEditable();
			},
			getEditable: function () {
				var iframe, innerDoc, editable;
				iframe = document.getElementById('content_ifr');
				innerDoc = iframe.contentDocument || iframe.contentWindow.document;
				editable = innerDoc.getElementById('tinymce');
				KijeEditor.doc = innerDoc;
				KijeEditor.extensions.editable = editable;
				return this.initThemeToolbar();
			},
			initThemeToolbar: function () {
				var themeToolbar = document.createElement('div');
				var themes = {
					'default': {
						name: 'default',
						src: 'logo-twitter.png'
					},
					'github': {
						name: 'github',
						src: 'github-logo.png'
					},
					'elizabeth': {
						name: 'elizabeth',
						src: 'logo-twitter.png'
					},
					'ahead': {
						name: 'ahead',
						src: 'logo-twitter.png'
					},
					'parsley': {
						name: 'parsley',
						src: 'logo-twitter.png'
					},
					'fashion': {
						name: 'fashion',
						src: 'logo-twitter.png'
					}
				}
				KijeEditor.extensions.themeLength = Object.keys(themes).length - 1;
				themeToolbar.className = 'ked_theme';
				themeToolbar.appendChild(document.createElement('ul'));

				for(var i in themes) {
					var li = document.createElement('li');
					var img = document.createElement('span');
					li.className = 'ked_theme_tooltip ' + themes[i].name;
					if (i=='default') li.className = li.className + ' is-visible';
					themeToolbar.firstChild.appendChild(li);
				}

				var prevButton = document.createElement('span');
				var nextButton = document.createElement('span');
				prevButton.className = 'ked_prevButton';
				nextButton.className = 'ked_nextButton';

				KijeEditor.extensions.prevButton = prevButton;
				KijeEditor.extensions.nextButton = nextButton;

				themeToolbar.appendChild(prevButton);
				themeToolbar.appendChild(nextButton);

				KijeEditor.themeToolbar = themeToolbar;
				document.getElementById('postbox-container-2').appendChild(themeToolbar);

				return this.setStyleTag();
			},
			setStyleTag: function () {
				var style = document.getElementById('kije-main-style-css');
				var style2 = style.cloneNode(true);
				var fontAwesome = document.createElement('link');
				var fontsGoogle = document.createElement('link');
				fontAwesome.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';
				fontAwesome.type = 'text/css';
				fontAwesome.rel = 'stylesheet';
				fontsGoogle.href = 'https://fonts.googleapis.com/css?family=ABeeZee|Libre+Franklin|Lora:400,400i|Montserrat:400,700|Muli|Open+Sans|PT+Serif';
				fontsGoogle.rel = 'stylesheet';
				KijeEditor.doc.head.appendChild(fontAwesome);
				KijeEditor.doc.head.appendChild(style);
				KijeEditor.doc.head.appendChild(fontsGoogle);
				var fontAwesome2 = fontAwesome.cloneNode(true);
				document.head.appendChild(fontAwesome2);
				document.head.appendChild(style2);
				return this.initToolbar();
			},
			initToolbar: function () {
				var doc = KijeEditor.doc;
				var body = doc.body,
					toolbar = doc.createElement('div');
					toolbar.className = 'ked_toolbar';
					toolbar.appendChild(doc.createElement('ul'));
					toolbar.firstChild.className = 'ked_toolbar_ul';
					Object.keys(KijeEditor.extensions.buttons).forEach(function (key, index) {
						toolbar.firstChild.appendChild(doc.createElement('li'));
						toolbar.firstChild.lastChild.appendChild(doc.createElement('button'));
						toolbar.firstChild.lastChild.firstChild.className = 'ked-editor-action ked-editor-action-' + KijeEditor.extensions.buttons[key].name;
						toolbar.firstChild.lastChild.firstChild.setAttribute('data-action', KijeEditor.extensions.buttons[key].action);
						toolbar.firstChild.lastChild.firstChild.setAttribute('title', KijeEditor.extensions.buttons[key].aria);
					});
					toolbar.style.visibility = 'hidden';
					KijeEditor.toolbar = toolbar;
					doc.body.parentNode.appendChild(toolbar);
					KijeEditor.events.attachDOMEvent(KijeEditor.toolbar, 'click', toolbarExecCommand, false);
					return this.initEvents(KijeEditor.extensions);
			},
			initEvents: function (extensions) {
				KijeEditor.events.attachDOMEvent(extensions.editable, 'keydown', editableCtrlModify, false);
				KijeEditor.events.attachDOMEvent(extensions.editable, 'keyup', editableShiftModify, false);
				KijeEditor.events.attachDOMEvent(extensions.editable, 'focus', KijeEditor.util.modifyDeselect, false);
				KijeEditor.events.attachDOMEvent(extensions.editable, 'click', editableClickDeselect, false);
				KijeEditor.events.attachDOMEvent(extensions.editable, 'contextmenu', editableRightClick, false);
				KijeEditor.events.attachDOMEvent(extensions.editable, 'keyup', KijeEditor.util.positionToolbar, false);
				KijeEditor.events.attachDOMEvent(extensions.editable, 'mouseup', editableMouseUp, false);
				KijeEditor.events.attachDOMEvent(extensions.editable, 'focus', hideThemeToolbar, false);
				KijeEditor.events.attachDOMEvent(extensions.editable, 'blur', showThemeToolbar, false);
				KijeEditor.events.attachDOMEvent(document, 'click', hideToolbarBlocker, false);
				KijeEditor.events.attachDOMEvent(KijeEditor.themeToolbar, 'click', themeToolbarClick, false);
				KijeEditor.events.attachDOMEvent(extensions.editable, 'keydown', switchTooltip, false);
				KijeEditor.events.attachDOMEvent(extensions.editable, 'keydown', detectEnterkeyForCurrentTheme, false);
				KijeEditor.events.attachDOMEvent(extensions.prevButton, 'click', themePrevButtonClick, false);
				KijeEditor.events.attachDOMEvent(extensions.nextButton, 'click', themeNextButtonClick, false);
				KijeEditor.events.attachDOMEvent(extensions.editable, 'keydown', editableEscUnselect, false);
				KijeEditor.events.attachDOMEvent(extensions.editable, 'keydown', editableSelectionMove, false);
				setTimeout(function () {
					KijeEditor.toolbar.setAttribute('style','');
				},200);
			}
		}
		KijeEditor.setup = Setup;
	})();

	KijeEditor.prototype = {
		init: function () {
			return KijeEditor.setup.checkDomReady();
		}
	}

	kijeEditor = new KijeEditor();
	return kijeEditor;
}()));