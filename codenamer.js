/*****************************************************
 This file is part of Codenamer.

    Codenamer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Codenamer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Codenamer.  If not, see <https://www.gnu.org/licenses/>.

	Home: https://github.com/Rhade-R/codenamer

*******************************************************/

'use strict';

const version = 'v0.1';
const cr = `© ${new Date().getFullYear()} Rhade`;
const ui = document.getElementsByTagName('*');
const options = {
	N: 16384,
	r: 8,
	p: 1,
	dkLen: 4,
	encoding: undefined
};
const _ = new Proxy(ui, {
	get: (obj, prop) => {
		return obj[prop].value.replace(/^\s*(.*)\s*$/, '$1');
	},
	set: (obj, prop, val) => {
		val = `${val.replace(/^\s*(.*)\s*$/, '$1')}`;
		if (obj[prop].value !== val) obj[prop].value = val;
		return true;
	}
});

window.addEventListener('load', e => {
	ui.copyright.setAttribute('cont', cr);
	ui.version.setAttribute('cont', version);
	ui.main.hidden = false;
});
ui.name.addEventListener('input', e => {
	handleNameChange();
});
ui.lname.addEventListener('input', e => {
	handleNameChange();
});
ui.name.addEventListener('focusin', e => {
	ui.name.select();
});
ui.lname.addEventListener('focusin', e => {
	ui.lname.select();
});
ui.secret.addEventListener('focusin', e => {
	ui.secret.select();
});
ui.copyButton.addEventListener('click', e => {
	copyToClipboard(
		'Anime archetype: '+ui.anime.textContent+'\n'+
		'Military codename: '+ui.military.textContent+'\n'+
		'More coming soon!... maybe...'+
		'~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'+
		`\nCodenamer ${version} - ${cr}\n${window.location.href}`
	);
	window.alert('Results sent to the clipboard');
});
ui.genButton.addEventListener('click', e => {
	ui.genButton.className = 'hidden';
	const pwd = `${_.name}${_.lname}${_.secret}`;
	new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(undefined);
		}, 200);
	}).then(r => {
		scrypt(pwd, 'anime', options, derivedKey => {
			console.debug(`anime derived key: ${derivedKey}`);
			const i = getNearestValue(anime, byteArray2index(derivedKey));
			ui.anime.textContent = anime[i];
		});
	}).then(r => {
		scrypt(pwd, 'military', options, derivedKey => {
			console.debug(`military derived key: ${derivedKey}`);
			const i = getNearestValue(military, byteArray2index(derivedKey));
			ui.military.textContent = military[i];
		});
	}).then(r => {
		ui.buttonWrapper.className = 'hidden';
		ui.resultsWrapper.className = 'col fadein';
		// ui.resultsWrapper.className.replace(/\bhidden\b/g, '');
		console.debug('all done');
	});
	ui.buttonWrapper.className = 'loader';
	ui.fieldsWrapper.className += ' hidden';
	ui.titleWrapper.className += ' hidden';
	console.debug('working...');
});

function byteArray2index(a) {
	return ('000'+a[0]).slice(-3)+
		('000'+a[1]).slice(-3)+
		('000'+a[2]).slice(-3)+
		('000'+a[3]).slice(-3);
}

function getNearestValue(obj, value, sorted = true) {
	if (obj.hasOwnProperty(value)) return obj[value];
	obj = Array.isArray(obj) ? obj : Object.keys(obj);
	if (sorted) {
		let a = 0;
		for(const b of obj) {
			if (Math.abs(a - value) < Math.abs(b - value)) {
				break;
			}
			a = b;
		}
		return a;
	}
	return obj.reduce((a, b) => Math.abs(a - value) < Math.abs(b - value) ? a : b);
}

function handleNameChange() {
	ui.genButton.disabled = (!_.name) || (!_.lname);
}

function copyToClipboard(str) {
	/* https://github.com/30-seconds/30-seconds-of-code */
	const el = document.createElement('textarea');
	el.value = str;
	el.setAttribute('readonly', '');
	el.style.position = 'absolute';
	el.style.left = '-9999px';
	document.body.appendChild(el);
	const selected =
	document.getSelection().rangeCount > 0
	? document.getSelection().getRangeAt(0)
	: false;
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);
	if (selected) {
		document.getSelection().removeAllRanges();
		document.getSelection().addRange(selected);
	}
}
