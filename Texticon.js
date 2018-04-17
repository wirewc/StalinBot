const FLIP_TABLES = ['(╯°□°）╯︵ ┻━┻',
		'(┛◉Д◉)┛彡┻━┻',
		'(ﾉ≧∇≦)ﾉ ﾐ ┸━┸',
		'(ノಠ益ಠ)ノ彡┻━┻',
		'(╯ರ ~ ರ）╯︵ ┻━┻',
		'(┛ಸ_ಸ)┛彡┻━┻',
		'(ﾉ´･ω･)ﾉ ﾐ ┸━┸',
		'(ノಥ,_｣ಥ)ノ彡┻━┻',
		'(┛✧Д✧))┛彡┻━┻',
		'┻━┻ ︵ヽ(`Д´)ﾉ︵﻿ ┻━┻',
		'┻━┻ ︵﻿ ¯\(ツ)/¯ ︵ ┻━┻',
		'(ノTДT)ノ ┫:･’.::･┻┻:･’.::･',
		'(ノ｀⌒´)ノ ┫：・’.：：・┻┻：・’.：：・',
		'(ﾉ*｀▽´*)ﾉ ⌒┫ ┻ ┣ ┳',
		'┻━┻ミ＼(≧ﾛ≦＼)',
		'┻━┻︵└(՞▃՞ └)',
		'┻━┻︵└(´▃｀└)',
		'─=≡Σ((((╯°□°）╯︵ ┻━┻',
		'(ノ｀´)ノ ~┻━┻',
		'(-_- )ﾉ⌒┫ ┻ ┣',
		'(ノ￣皿￣）ノ ⌒=== ┫',
		'༼ﾉຈل͜ຈ༽ﾉ︵┻━┻',
		'ヽ༼ຈل͜ຈ༽ﾉ⌒┫ ┻ ┣',
		'ﾐ┻┻(ﾉ>｡<)ﾉ',
		'(ﾉ｀A”)ﾉ ⌒┫ ┻ ┣ ┳☆(x x)',
		'(ノ｀m´)ノ ~┻━┻ (/o＼)',
		'ミ(ノ￣^￣)ノ≡≡≡≡≡━┳━☆()￣□￣)/'];

const SET_TABLES = ['┣ﾍ(^▽^ﾍ)Ξ(ﾟ▽ﾟ*)ﾉ┳━┳',
		'┬──┬ ノ( ゜-゜ノ)',
		'┬──┬﻿ ¯\_(ツ)',
		'(ヘ･_･)ヘ┳━┳',
		'ヘ(´° □°)ヘ┳━┳',
		'┣ﾍ(≧∇≦ﾍ)… (≧∇≦)/┳━┳'];

var GetRandomTexticon = function(texticonArray)
{
	if((texticonArray) && (texticonArray.length > 0))
	{
		return texticonArray[Math.floor(Math.random() * texticonArray.length)];
	}

	return 'Unable to find texticon.';
};

exports.GetFlip = function()
{
	return GetRandomTexticon(FLIP_TABLES);
};

exports.GetSet = function()
{
	return GetRandomTexticon(SET_TABLES);
};
