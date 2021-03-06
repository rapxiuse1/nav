//网站登录类
function Login(data) {
	this.mode = null
	this.basePath = null
	var LoginObject = this;
		
	var basePath = location.origin + "/" + location.pathname.split("/")[1];	//域名地址
	var check = true;	//开启js格式效验
	var dealResult = true;
	var codeEle = null
	
	//设置初始值
	if (data && data.basePath) {
		basePath = data.basePath
	}
	this.basePath = basePath
	
	if (data && data.check === false) {
		check = false
	}
	if (data && data.dealResult === false) {
		dealResult = false
	}
	
	//设置弹出样式
	Login.prototype.$tip = function(callback) {
		$tip = callback;
	}
	//设置请求
	Login.prototype.request = function(callback) {
		request = callback;
	}
	
	Login.prototype.bindLogin = function(param) {
		LoginObject.mode = "login"
		if (param) {
			return userLogin(param);
		}
	}
	Login.prototype.bindRegiste = function(param) {
		LoginObject.mode = "registe"
		if (param) {
			return registe(param)
		}
	}
	Login.prototype.bindFind = function(param) {
		LoginObject.mode = "find"
		if (param) {
			return findPwd(param)
		}
	}
	Login.prototype.setCode = function(imgElement) {
		if (imgElement) {
			codeEle = imgElement
			setimg(imgElement)
			imgElement["onclick"] = function() {
				setimg(imgElement)
			}
		}
	}
	
	
	var getEle = function(a) {
	    return document.getElementById(a);
	};
	var $tip = function(a) {
		//可以自定义弹出框
		alert(a);
	}
	var setimg = function(ele) {
		ele["src"] = basePath + "/LEAP/Service/RPC/RPC.DO?type=994&rando=" + new Date().getTime()
	}
	//账号登录
	var userLogin = function(bean) {
		var sid = null;
		var serverTime = null;
		if (typeof leapclient == "object") {
			sid = leapclient.getsid();
			serverTime = leapclient._serverTime;
		} else {
			sid = "longrise2011"
			serverTime = new Date().getTime()
		}
		
	    var param = {
	    		sid: sid, 
	    		username: bean["username"].trim(), 
	    		pwd: new desservice().encrypt(encbase64data(base64encode(new md5Code(bean["pwd"].trim()).getValue())), sid + new DateFormat(serverTime).format("yyyy-mm-dd"))
		}
	    if (bean["code"] != undefined) {
	    	param.code = bean["code"].trim();
	    	if (codeEle) {
	    		setimg(codeEle)
			}
	    }
	    
	    var result = request("adt_web_login", param);
	    if (dealResult) {
			if (result) {
		    	var state = result.resultstate;
		    	if (state == 1) {
		    		$tip("登录成功！")
				} else if (state == 2) {
					$tip("请输入正确的验证码！")
				} else if (state == 3 || state == 4 || state == 5) {
					$tip("请输入正确的用户名或密码！")
				} else if (state == 6) {
					$tip("账号锁定中，解锁时间：" + result.result + "秒")
				} else {
					console.log(result.resultdesc)
				}
			} else {
				console.log("用户登录失败！")
			}
		} else {
			return result;
		}
	}

	//账号注册
	var registe = function(bean) {
		if (bean.username && bean.pwd) {
			bean.username = bean.username.trim();
			bean.pwd = bean.pwd.trim();
		}
		if (bean.pwd2) {
			bean.pwd2 = bean.pwd2.trim();
		}
		
		if (check && !checkBean(bean, "2")) {
			return;
		} else if(!check) {
			bean.pwd2 = undefined
		}
		
		var result = request("adt_web_registe", bean);
		if (dealResult) {
			if (result) {
		    	var state = result.resultstate;
		    	if (state == 1) {
		    		$tip("注册成功！")
				} else if (state == 2) {
					$tip("用户名已存在！")
				} else if (state == 3) {
					$tip("证件号码已存在！")
				} else {
					console.log(result.resultdesc)
				}
			} else {
				console.log("用户注册失败！")
			}
		} else {
			return result;
		}
	}

	//密码找回
	var findPwd = function(bean) {
		if (bean.username) {
			bean.username = bean.username.trim()
		}
		
		if (check && !checkBean(bean, "3")) {
			return;
		}
		
		var result = request("adt_web_findPwd", bean);
		if (dealResult) {
		    if (result) {
		    	var state = result.resultstate;
		    	if (state == 1) {
		    		$tip("找回成功，系统核验无误后将把密码已短信的形式发送给您！")
				} else if (state == 6) {
					$tip("请输入正确的预留信息！")
				} else {
					console.log(result.resultdesc)
				}
			} else {
				console.log("密码找回失败！")
			}
		} else {
			return result;
		}
	}

	var request = function(method, param) {
		var result = null;
	    if (typeof leapclient == "object") {
	    	result = leapclient.request("adt_webMain", {bean: {
		    	name: method, 
		    	bean: param
		    }}, null, null, "web", "web")
		} else if (typeof $ == "function") {
			$.ajax({
				url: basePath + "/restservices/TwoWeb/adt_restMain/query", 
				async: false, 
				data: {
					"bean": JSON.stringify({
						name: method, 
						bean: param
					})
				}, 
				success: function(data){
					console.log(data)
					result = data
				}
			})
		}
	    return result;
	}

	//type 2：注册	3：找回密码
	var checkBean = function(data, type) {
		var username = data["username"];
		if (!username || username == "") {
			$tip("用户名不可为空")
			return false;
		} else if (!userNameCheck(username)) {
			$tip("用户名格式：以字母开头，允许使用字母数字下划线，6-20位组成")
			return false;
		}
		if (type == "2") {
			var pwd = data["pwd"];
			if (!pwd || pwd == "") {
				$tip("密码不可为空")
				return false;
			} else if (!pwdCheck(pwd)) {
				$tip("请输入8-16字母与数组组合的密码")
				return false;
			}
			var pwd2 = data["pwd2"];
			if (pwd2 != null) {
				if (pwd2 == "") {
					$tip("确认密码不可为空")
					return false;
				} else if (!isEqualCheck(pwd, pwd2)) {
					$tip("两次密码输入不一致")
					return false;
				}
				data["pwd2"] = undefined;
			}
		}
		var phone = data["phone"];
		if (!phone || phone == "") {
			$tip("请输入手机号码")
			return false;
		} else if (!phoneCheck(phone)) {
			$tip("请输入有效的手机号码")
			return false;
		}
		var cardno = data["cardno"];
		if (!cardno || cardno == "") {
			$tip("请输入证件号码")
			return false;
		} else if (!IDCardCheck(cardno) && !creditNoCheck(cardno)) {
			$tip("请输入有效的证件号码")
			return false;
		}
		return true;
	}

	//用户名格式验证
	var userNameCheck = function(name)
	{
		var result = false;
		if ( name)
		{
			var reg = /^[a-zA-Z][a-zA-Z0-9_]{5,20}$/;
			if ( reg.test(name))
			{
				result = true;
			}
		}
		return result;
	}
	//密码格式验证
	var pwdCheck = function(pwd)
	{
		var result = false;
		if ( pwd)
		{
			var reg = /(?=.*[0-9].*)(?=.*[a-zA-Z].*).{8,15}/;
			if ( reg.test(pwd))
			{
				result = true;
			}
		}
		return result;
	}
	//再次输入密码是否正确
	var isEqualCheck = function(a,b){
		var result = false;
		if(a == b){
			result = true;
		}
		return result;
	}
	//手机号
	var phoneCheck = function(no){
	    var result = false;
		if ( no)
		{
			if (no.indexOf(" ") == -1)
			{
				var telReg = !!no.match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[567803]|18[0-9]|14[57])[0-9]{8}$/);
				if ( telReg){
	                result = true;
	            }
			}
		}
		return result;
	}
	//身份证
	var IDCardCheck = function(idcard){   
	    var result = false;
		if ( idcard)
		{
			var regIdCard = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
			if (regIdCard.test( idcard))
			{
				if (idcard.length == 18)
				{
					var idCardWi = new Array(7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2);
					var idCardY = new Array(1,0,10,9,8,7,6,5,4,3,2);
					var idCardWiSum = 0;
					for(var i = 0;i < 17;i++)
					{
						idCardWiSum += idcard.substring(i, i + 1) * idCardWi[i];
					}
					var idCardMod = idCardWiSum % 11;
					var idCardLast = idcard.substring(17);
					if (idCardMod == 2)
					{
						if (idCardLast == "X" || idCardLast == "x")
						{
							result = true;
						}
					}
					else
					{
						//用计算出的验证码与最后一位身份证号码匹配，如果一致，说明通过，否则是无效的身份证号码
						if (idCardLast == idCardY[idCardMod])
						{
							result = true;
						}
					}
				}
			}
	    }
		return result;
	}	
	//社会统一信用代码
	var creditNoCheck = function( credit){
	    var result = false;
	    if ( credit.length ==18)
	    {
	        //字符集数组
	        var fin_array = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'T', 'U', 'W', 'X', 'Y'];
	        //加权数组
	        var i_array = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28];
	        //结果数组
	        var val_array = [];
	        //相乘数组
	        var ch_array = [];
	        //Sigma
	        var sigma = 0;
	        //转换成字符集的值
	        for (var i = 0; i < 17; i++) {
	            val_array[i] = fin_array.indexOf ? fin_array.indexOf( credit.charAt(i)) : fin_array.indexof( credit.charAt(i));
	        }
	        //校验是否包含字符集之外的字符
	        for (var i = 0; i < 17; i++) {
	            if (val_array[i] == -1) 
	            {
	                return result;
	            }
	        }
	        //生成加权结果
	        for (var i = 0; i < 17; i++) {
	            ch_array[i] = val_array[i] * i_array[i];
	        }
	        //求出Sigma
	        for (var i = 0; i < 17; i++) {
	            sigma = sigma + ch_array[i];
	        }
	        //求出校验位
	        var vali = fin_array[31 - sigma % 31];
	        //查看校验码是否正确
	        if ( credit.charAt(17) == vali) {
	            result = true;
	        }
	    }
	    return result;
	}

	var DateFormat = function(b) {
	    var d = function(e) {
	        e = e.replace(/yyyy/g, b.getFullYear());
	        e = e.replace(/yy/g, b.getFullYear().toString().slice(2));
	        e = e.replace(/mm/g, (b.getMonth() + 1) < 10 ? "0" + (b.getMonth() + 1) : b.getMonth() + 1);
	        e = e.replace(/dd/g, b.getDate() < 10 ? "0" + b.getDate() : b.getDate());
	        e = e.replace(/wk/g, b.getDay() < 10 ? "0" + b.getDay() : b.getDay());
	        e = e.replace(/hh/g, b.getHours() < 10 ? "0" + b.getHours() : b.getHours());
	        e = e.replace(/mi/g, b.getMinutes() < 10 ? "0" + b.getMinutes() : b.getMinutes());
	        e = e.replace(/ss/g, b.getSeconds() < 10 ? "0" + b.getSeconds() : b.getSeconds());
	        e = e.replace(/ms/g, b.getMilliseconds() < 10 ? "0" + b.getMilliseconds() : b.getMilliseconds());
	        return e;
	    };
	    var a = function() {};
	    var c = function() {
	        return b.toLocaleString();
	    };
	    b = new Date(b);
	    if (!b || b == "NaN") {
	        b = new Date();
	    }
	    this.format = d;
	    this.valueOf = a;
	    this.toString = c;
	};
	//平台加密
	var desservice = function() {
	    this.encrypt = function(B, A, z, y) {
	        return d(B, A, z, y);
	    }
	    ;
	    this.deencrypt = function(B, A, z, y) {
	        return h(B, A, z, y);
	    }
	    ;
	    function d(X, Q, A, E) {
	        var H = X.length;
	        var I = "";
	        var U, R, O, Y, G, J;
	        if (Q != null && Q != "") {
	            U = o(Q);
	            Y = U.length;
	        }
	        if (A != null && A != "") {
	            R = o(A);
	            G = R.length;
	        }
	        if (E != null && E != "") {
	            O = o(E);
	            J = O.length;
	        }
	        if (H > 0) {
	            if (H < 4) {
	                var V = a(X);
	                var F;
	                if (Q != null && Q != "" && A != null && A != "" && E != null && E != "") {
	                    var T;
	                    var M, L, K;
	                    T = V;
	                    for (M = 0; M < Y; M++) {
	                        T = e(T, U[M]);
	                    }
	                    for (L = 0; L < G; L++) {
	                        T = e(T, R[L]);
	                    }
	                    for (K = 0; K < J; K++) {
	                        T = e(T, O[K]);
	                    }
	                    F = T;
	                } else {
	                    if (Q != null && Q != "" && A != null && A != "") {
	                        var T;
	                        var M, L;
	                        T = V;
	                        for (M = 0; M < Y; M++) {
	                            T = e(T, U[M]);
	                        }
	                        for (L = 0; L < G; L++) {
	                            T = e(T, R[L]);
	                        }
	                        F = T;
	                    } else {
	                        if (Q != null && Q != "") {
	                            var T;
	                            var M = 0;
	                            T = V;
	                            for (M = 0; M < Y; M++) {
	                                T = e(T, U[M]);
	                            }
	                            F = T;
	                        }
	                    }
	                }
	                I = f(F);
	            } else {
	                var P = parseInt(H / 4);
	                var N = H % 4;
	                var S = 0;
	                for (S = 0; S < P; S++) {
	                    var D = X.substring(S * 4 + 0, S * 4 + 4);
	                    var W = a(D);
	                    var F;
	                    if (Q != null && Q != "" && A != null && A != "" && E != null && E != "") {
	                        var T;
	                        var M, L, K;
	                        T = W;
	                        for (M = 0; M < Y; M++) {
	                            T = e(T, U[M]);
	                        }
	                        for (L = 0; L < G; L++) {
	                            T = e(T, R[L]);
	                        }
	                        for (K = 0; K < J; K++) {
	                            T = e(T, O[K]);
	                        }
	                        F = T;
	                    } else {
	                        if (Q != null && Q != "" && A != null && A != "") {
	                            var T;
	                            var M, L;
	                            T = W;
	                            for (M = 0; M < Y; M++) {
	                                T = e(T, U[M]);
	                            }
	                            for (L = 0; L < G; L++) {
	                                T = e(T, R[L]);
	                            }
	                            F = T;
	                        } else {
	                            if (Q != null && Q != "") {
	                                var T;
	                                var M;
	                                T = W;
	                                for (M = 0; M < Y; M++) {
	                                    T = e(T, U[M]);
	                                }
	                                F = T;
	                            }
	                        }
	                    }
	                    I += f(F);
	                }
	                if (N > 0) {
	                    var B = X.substring(P * 4 + 0, H);
	                    var W = a(B);
	                    var F;
	                    if (Q != null && Q != "" && A != null && A != "" && E != null && E != "") {
	                        var T;
	                        var M, L, K;
	                        T = W;
	                        for (M = 0; M < Y; M++) {
	                            T = e(T, U[M]);
	                        }
	                        for (L = 0; L < G; L++) {
	                            T = e(T, R[L]);
	                        }
	                        for (K = 0; K < J; K++) {
	                            T = e(T, O[K]);
	                        }
	                        F = T;
	                    } else {
	                        if (Q != null && Q != "" && A != null && A != "") {
	                            var T;
	                            var M, L;
	                            T = W;
	                            for (M = 0; M < Y; M++) {
	                                T = e(T, U[M]);
	                            }
	                            for (L = 0; L < G; L++) {
	                                T = e(T, R[L]);
	                            }
	                            F = T;
	                        } else {
	                            if (Q != null && Q != "") {
	                                var T;
	                                var M;
	                                T = W;
	                                for (M = 0; M < Y; M++) {
	                                    T = e(T, U[M]);
	                                }
	                                F = T;
	                            }
	                        }
	                    }
	                    I += f(F);
	                }
	            }
	        }
	        return I;
	    }
	    function h(W, P, A, D) {
	        var F = W.length;
	        var G = "";
	        var U, R, M, X, E, I;
	        if (P != null && P != "") {
	            U = o(P);
	            X = U.length;
	        }
	        if (A != null && A != "") {
	            R = o(A);
	            E = R.length;
	        }
	        if (D != null && D != "") {
	            M = o(D);
	            I = M.length;
	        }
	        var O = parseInt(F / 16);
	        var T = 0;
	        for (T = 0; T < O; T++) {
	            var B = W.substring(T * 16 + 0, T * 16 + 16);
	            var H = c(B);
	            var V = new Array(64);
	            var Q = 0;
	            for (Q = 0; Q < 64; Q++) {
	                V[Q] = parseInt(H.substring(Q, Q + 1));
	            }
	            var N;
	            if (P != null && P != "" && A != null && A != "" && D != null && D != "") {
	                var S;
	                var L, K, J;
	                S = V;
	                for (L = I - 1; L >= 0; L--) {
	                    S = l(S, M[L]);
	                }
	                for (K = E - 1; K >= 0; K--) {
	                    S = l(S, R[K]);
	                }
	                for (J = X - 1; J >= 0; J--) {
	                    S = l(S, U[J]);
	                }
	                N = S;
	            } else {
	                if (P != null && P != "" && A != null && A != "") {
	                    var S;
	                    var L, K, J;
	                    S = V;
	                    for (L = E - 1; L >= 0; L--) {
	                        S = l(S, R[L]);
	                    }
	                    for (K = X - 1; K >= 0; K--) {
	                        S = l(S, U[K]);
	                    }
	                    N = S;
	                } else {
	                    if (P != null && P != "") {
	                        var S;
	                        var L, K, J;
	                        S = V;
	                        for (L = X - 1; L >= 0; L--) {
	                            S = l(S, U[L]);
	                        }
	                        N = S;
	                    }
	                }
	            }
	            G += s(N);
	        }
	        return G;
	    }
	    function o(B) {
	        var y = new Array();
	        var A = B.length;
	        var D = parseInt(A / 4);
	        var E = A % 4;
	        var z = 0;
	        for (z = 0; z < D; z++) {
	            y[z] = a(B.substring(z * 4 + 0, z * 4 + 4));
	        }
	        if (E > 0) {
	            y[z] = a(B.substring(z * 4 + 0, A));
	        }
	        return y;
	    }
	    function a(H) {
	        var y = H.length;
	        var I = new Array(64);
	        if (y < 4) {
	            var F = 0
	              , E = 0
	              , A = 0
	              , z = 0;
	            for (F = 0; F < y; F++) {
	                var D = H.charCodeAt(F);
	                for (E = 0; E < 16; E++) {
	                    var G = 1
	                      , B = 0;
	                    for (B = 15; B > E; B--) {
	                        G *= 2;
	                    }
	                    I[16 * F + E] = parseInt(D / G) % 2;
	                }
	            }
	            for (A = y; A < 4; A++) {
	                var D = 0;
	                for (z = 0; z < 16; z++) {
	                    var G = 1
	                      , B = 0;
	                    for (B = 15; B > z; B--) {
	                        G *= 2;
	                    }
	                    I[16 * A + z] = parseInt(D / G) % 2;
	                }
	            }
	        } else {
	            for (F = 0; F < 4; F++) {
	                var D = H.charCodeAt(F);
	                for (E = 0; E < 16; E++) {
	                    var G = 1;
	                    for (B = 15; B > E; B--) {
	                        G *= 2;
	                    }
	                    I[16 * F + E] = parseInt(D / G) % 2;
	                }
	            }
	        }
	        return I;
	    }
	    function b(z) {
	        var y;
	        switch (z) {
	        case "0000":
	            y = "0";
	            break;
	        case "0001":
	            y = "1";
	            break;
	        case "0010":
	            y = "2";
	            break;
	        case "0011":
	            y = "3";
	            break;
	        case "0100":
	            y = "4";
	            break;
	        case "0101":
	            y = "5";
	            break;
	        case "0110":
	            y = "6";
	            break;
	        case "0111":
	            y = "7";
	            break;
	        case "1000":
	            y = "8";
	            break;
	        case "1001":
	            y = "9";
	            break;
	        case "1010":
	            y = "A";
	            break;
	        case "1011":
	            y = "B";
	            break;
	        case "1100":
	            y = "C";
	            break;
	        case "1101":
	            y = "D";
	            break;
	        case "1110":
	            y = "E";
	            break;
	        case "1111":
	            y = "F";
	            break;
	        }
	        return y;
	    }
	    function g(y) {
	        var z;
	        switch (y) {
	        case "0":
	            z = "0000";
	            break;
	        case "1":
	            z = "0001";
	            break;
	        case "2":
	            z = "0010";
	            break;
	        case "3":
	            z = "0011";
	            break;
	        case "4":
	            z = "0100";
	            break;
	        case "5":
	            z = "0101";
	            break;
	        case "6":
	            z = "0110";
	            break;
	        case "7":
	            z = "0111";
	            break;
	        case "8":
	            z = "1000";
	            break;
	        case "9":
	            z = "1001";
	            break;
	        case "A":
	            z = "1010";
	            break;
	        case "B":
	            z = "1011";
	            break;
	        case "C":
	            z = "1100";
	            break;
	        case "D":
	            z = "1101";
	            break;
	        case "E":
	            z = "1110";
	            break;
	        case "F":
	            z = "1111";
	            break;
	        }
	        return z;
	    }
	    function s(B) {
	        var A = "";
	        for (i = 0; i < 4; i++) {
	            var z = 0;
	            for (j = 0; j < 16; j++) {
	                var y = 1;
	                for (m = 15; m > j; m--) {
	                    y *= 2;
	                }
	                z += B[16 * i + j] * y;
	            }
	            if (z != 0) {
	                A += String.fromCharCode(z);
	            }
	        }
	        return A;
	    }
	    function f(A) {
	        var z = "";
	        for (i = 0; i < 16; i++) {
	            var y = "";
	            for (j = 0; j < 4; j++) {
	                y += A[i * 4 + j];
	            }
	            z += b(y);
	        }
	        return z;
	    }
	    function c(y) {
	        var z = "";
	        for (i = 0; i < 16; i++) {
	            z += g(y.substring(i, i + 1));
	        }
	        return z;
	    }
	    function e(z, K) {
	        var N = t(K);
	        var J = w(z);
	        var A = new Array(32);
	        var M = new Array(32);
	        var F = new Array(32);
	        var I = 0
	          , H = 0
	          , G = 0
	          , E = 0
	          , D = 0;
	        for (G = 0; G < 32; G++) {
	            A[G] = J[G];
	            M[G] = J[32 + G];
	        }
	        for (I = 0; I < 16; I++) {
	            for (H = 0; H < 32; H++) {
	                F[H] = A[H];
	                A[H] = M[H];
	            }
	            var L = new Array(48);
	            for (E = 0; E < 48; E++) {
	                L[E] = N[I][E];
	            }
	            var y = r(q(p(r(u(M), L))), F);
	            for (D = 0; D < 32; D++) {
	                M[D] = y[D];
	            }
	        }
	        var B = new Array(64);
	        for (I = 0; I < 32; I++) {
	            B[I] = M[I];
	            B[32 + I] = A[I];
	        }
	        return v(B);
	    }
	    function l(z, K) {
	        var N = t(K);
	        var J = w(z);
	        var A = new Array(32);
	        var M = new Array(32);
	        var F = new Array(32);
	        var I = 0
	          , H = 0
	          , G = 0
	          , E = 0
	          , D = 0;
	        for (G = 0; G < 32; G++) {
	            A[G] = J[G];
	            M[G] = J[32 + G];
	        }
	        for (I = 15; I >= 0; I--) {
	            for (H = 0; H < 32; H++) {
	                F[H] = A[H];
	                A[H] = M[H];
	            }
	            var L = new Array(48);
	            for (E = 0; E < 48; E++) {
	                L[E] = N[I][E];
	            }
	            var y = r(q(p(r(u(M), L))), F);
	            for (D = 0; D < 32; D++) {
	                M[D] = y[D];
	            }
	        }
	        var B = new Array(64);
	        for (I = 0; I < 32; I++) {
	            B[I] = M[I];
	            B[32 + I] = A[I];
	        }
	        return v(B);
	    }
	    function w(z) {
	        var y = new Array(64);
	        for (i = 0,
	        m = 1,
	        n = 0; i < 4; i++,
	        m += 2,
	        n += 2) {
	            for (j = 7,
	            k = 0; j >= 0; j--,
	            k++) {
	                y[i * 8 + k] = z[j * 8 + m];
	                y[i * 8 + k + 32] = z[j * 8 + n];
	            }
	        }
	        return y;
	    }
	    function u(y) {
	        var z = new Array(48);
	        for (i = 0; i < 8; i++) {
	            if (i == 0) {
	                z[i * 6 + 0] = y[31];
	            } else {
	                z[i * 6 + 0] = y[i * 4 - 1];
	            }
	            z[i * 6 + 1] = y[i * 4 + 0];
	            z[i * 6 + 2] = y[i * 4 + 1];
	            z[i * 6 + 3] = y[i * 4 + 2];
	            z[i * 6 + 4] = y[i * 4 + 3];
	            if (i == 7) {
	                z[i * 6 + 5] = y[0];
	            } else {
	                z[i * 6 + 5] = y[i * 4 + 4];
	            }
	        }
	        return z;
	    }
	    function r(A, z) {
	        var y = new Array(A.length);
	        for (i = 0; i < A.length; i++) {
	            y[i] = A[i] ^ z[i];
	        }
	        return y;
	    }
	    function p(A) {
	        var y = new Array(32);
	        var D = "";
	        var L = [[14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7], [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8], [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0], [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]];
	        var K = [[15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10], [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5], [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15], [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]];
	        var J = [[10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8], [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1], [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7], [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]];
	        var I = [[7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15], [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9], [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4], [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]];
	        var H = [[2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9], [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6], [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14], [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]];
	        var G = [[12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11], [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8], [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6], [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]];
	        var F = [[4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1], [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6], [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2], [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]];
	        var E = [[13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7], [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2], [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8], [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]];
	        for (m = 0; m < 8; m++) {
	            var B = 0
	              , z = 0;
	            B = A[m * 6 + 0] * 2 + A[m * 6 + 5];
	            z = A[m * 6 + 1] * 2 * 2 * 2 + A[m * 6 + 2] * 2 * 2 + A[m * 6 + 3] * 2 + A[m * 6 + 4];
	            switch (m) {
	            case 0:
	                D = x(L[B][z]);
	                break;
	            case 1:
	                D = x(K[B][z]);
	                break;
	            case 2:
	                D = x(J[B][z]);
	                break;
	            case 3:
	                D = x(I[B][z]);
	                break;
	            case 4:
	                D = x(H[B][z]);
	                break;
	            case 5:
	                D = x(G[B][z]);
	                break;
	            case 6:
	                D = x(F[B][z]);
	                break;
	            case 7:
	                D = x(E[B][z]);
	                break;
	            }
	            y[m * 4 + 0] = parseInt(D.substring(0, 1));
	            y[m * 4 + 1] = parseInt(D.substring(1, 2));
	            y[m * 4 + 2] = parseInt(D.substring(2, 3));
	            y[m * 4 + 3] = parseInt(D.substring(3, 4));
	        }
	        return y;
	    }
	    function q(z) {
	        var y = new Array(32);
	        y[0] = z[15];
	        y[1] = z[6];
	        y[2] = z[19];
	        y[3] = z[20];
	        y[4] = z[28];
	        y[5] = z[11];
	        y[6] = z[27];
	        y[7] = z[16];
	        y[8] = z[0];
	        y[9] = z[14];
	        y[10] = z[22];
	        y[11] = z[25];
	        y[12] = z[4];
	        y[13] = z[17];
	        y[14] = z[30];
	        y[15] = z[9];
	        y[16] = z[1];
	        y[17] = z[7];
	        y[18] = z[23];
	        y[19] = z[13];
	        y[20] = z[31];
	        y[21] = z[26];
	        y[22] = z[2];
	        y[23] = z[8];
	        y[24] = z[18];
	        y[25] = z[12];
	        y[26] = z[29];
	        y[27] = z[5];
	        y[28] = z[21];
	        y[29] = z[10];
	        y[30] = z[3];
	        y[31] = z[24];
	        return y;
	    }
	    function v(y) {
	        var z = new Array(64);
	        z[0] = y[39];
	        z[1] = y[7];
	        z[2] = y[47];
	        z[3] = y[15];
	        z[4] = y[55];
	        z[5] = y[23];
	        z[6] = y[63];
	        z[7] = y[31];
	        z[8] = y[38];
	        z[9] = y[6];
	        z[10] = y[46];
	        z[11] = y[14];
	        z[12] = y[54];
	        z[13] = y[22];
	        z[14] = y[62];
	        z[15] = y[30];
	        z[16] = y[37];
	        z[17] = y[5];
	        z[18] = y[45];
	        z[19] = y[13];
	        z[20] = y[53];
	        z[21] = y[21];
	        z[22] = y[61];
	        z[23] = y[29];
	        z[24] = y[36];
	        z[25] = y[4];
	        z[26] = y[44];
	        z[27] = y[12];
	        z[28] = y[52];
	        z[29] = y[20];
	        z[30] = y[60];
	        z[31] = y[28];
	        z[32] = y[35];
	        z[33] = y[3];
	        z[34] = y[43];
	        z[35] = y[11];
	        z[36] = y[51];
	        z[37] = y[19];
	        z[38] = y[59];
	        z[39] = y[27];
	        z[40] = y[34];
	        z[41] = y[2];
	        z[42] = y[42];
	        z[43] = y[10];
	        z[44] = y[50];
	        z[45] = y[18];
	        z[46] = y[58];
	        z[47] = y[26];
	        z[48] = y[33];
	        z[49] = y[1];
	        z[50] = y[41];
	        z[51] = y[9];
	        z[52] = y[49];
	        z[53] = y[17];
	        z[54] = y[57];
	        z[55] = y[25];
	        z[56] = y[32];
	        z[57] = y[0];
	        z[58] = y[40];
	        z[59] = y[8];
	        z[60] = y[48];
	        z[61] = y[16];
	        z[62] = y[56];
	        z[63] = y[24];
	        return z;
	    }
	    function x(y) {
	        var z = "";
	        switch (y) {
	        case 0:
	            z = "0000";
	            break;
	        case 1:
	            z = "0001";
	            break;
	        case 2:
	            z = "0010";
	            break;
	        case 3:
	            z = "0011";
	            break;
	        case 4:
	            z = "0100";
	            break;
	        case 5:
	            z = "0101";
	            break;
	        case 6:
	            z = "0110";
	            break;
	        case 7:
	            z = "0111";
	            break;
	        case 8:
	            z = "1000";
	            break;
	        case 9:
	            z = "1001";
	            break;
	        case 10:
	            z = "1010";
	            break;
	        case 11:
	            z = "1011";
	            break;
	        case 12:
	            z = "1100";
	            break;
	        case 13:
	            z = "1101";
	            break;
	        case 14:
	            z = "1110";
	            break;
	        case 15:
	            z = "1111";
	            break;
	        }
	        return z;
	    }
	    function t(A) {
	        var D = new Array(56);
	        var E = new Array();
	        E[0] = new Array();
	        E[1] = new Array();
	        E[2] = new Array();
	        E[3] = new Array();
	        E[4] = new Array();
	        E[5] = new Array();
	        E[6] = new Array();
	        E[7] = new Array();
	        E[8] = new Array();
	        E[9] = new Array();
	        E[10] = new Array();
	        E[11] = new Array();
	        E[12] = new Array();
	        E[13] = new Array();
	        E[14] = new Array();
	        E[15] = new Array();
	        var y = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];
	        for (B = 0; B < 7; B++) {
	            for (j = 0,
	            k = 7; j < 8; j++,
	            k--) {
	                D[B * 8 + j] = A[8 * k + B];
	            }
	        }
	        var B = 0;
	        for (B = 0; B < 16; B++) {
	            var G = 0;
	            var z = 0;
	            for (j = 0; j < y[B]; j++) {
	                G = D[0];
	                z = D[28];
	                for (k = 0; k < 27; k++) {
	                    D[k] = D[k + 1];
	                    D[28 + k] = D[29 + k];
	                }
	                D[27] = G;
	                D[55] = z;
	            }
	            var F = new Array(48);
	            F[0] = D[13];
	            F[1] = D[16];
	            F[2] = D[10];
	            F[3] = D[23];
	            F[4] = D[0];
	            F[5] = D[4];
	            F[6] = D[2];
	            F[7] = D[27];
	            F[8] = D[14];
	            F[9] = D[5];
	            F[10] = D[20];
	            F[11] = D[9];
	            F[12] = D[22];
	            F[13] = D[18];
	            F[14] = D[11];
	            F[15] = D[3];
	            F[16] = D[25];
	            F[17] = D[7];
	            F[18] = D[15];
	            F[19] = D[6];
	            F[20] = D[26];
	            F[21] = D[19];
	            F[22] = D[12];
	            F[23] = D[1];
	            F[24] = D[40];
	            F[25] = D[51];
	            F[26] = D[30];
	            F[27] = D[36];
	            F[28] = D[46];
	            F[29] = D[54];
	            F[30] = D[29];
	            F[31] = D[39];
	            F[32] = D[50];
	            F[33] = D[44];
	            F[34] = D[32];
	            F[35] = D[47];
	            F[36] = D[43];
	            F[37] = D[48];
	            F[38] = D[38];
	            F[39] = D[55];
	            F[40] = D[33];
	            F[41] = D[52];
	            F[42] = D[45];
	            F[43] = D[41];
	            F[44] = D[49];
	            F[45] = D[35];
	            F[46] = D[28];
	            F[47] = D[31];
	            switch (B) {
	            case 0:
	                for (m = 0; m < 48; m++) {
	                    E[0][m] = F[m];
	                }
	                break;
	            case 1:
	                for (m = 0; m < 48; m++) {
	                    E[1][m] = F[m];
	                }
	                break;
	            case 2:
	                for (m = 0; m < 48; m++) {
	                    E[2][m] = F[m];
	                }
	                break;
	            case 3:
	                for (m = 0; m < 48; m++) {
	                    E[3][m] = F[m];
	                }
	                break;
	            case 4:
	                for (m = 0; m < 48; m++) {
	                    E[4][m] = F[m];
	                }
	                break;
	            case 5:
	                for (m = 0; m < 48; m++) {
	                    E[5][m] = F[m];
	                }
	                break;
	            case 6:
	                for (m = 0; m < 48; m++) {
	                    E[6][m] = F[m];
	                }
	                break;
	            case 7:
	                for (m = 0; m < 48; m++) {
	                    E[7][m] = F[m];
	                }
	                break;
	            case 8:
	                for (m = 0; m < 48; m++) {
	                    E[8][m] = F[m];
	                }
	                break;
	            case 9:
	                for (m = 0; m < 48; m++) {
	                    E[9][m] = F[m];
	                }
	                break;
	            case 10:
	                for (m = 0; m < 48; m++) {
	                    E[10][m] = F[m];
	                }
	                break;
	            case 11:
	                for (m = 0; m < 48; m++) {
	                    E[11][m] = F[m];
	                }
	                break;
	            case 12:
	                for (m = 0; m < 48; m++) {
	                    E[12][m] = F[m];
	                }
	                break;
	            case 13:
	                for (m = 0; m < 48; m++) {
	                    E[13][m] = F[m];
	                }
	                break;
	            case 14:
	                for (m = 0; m < 48; m++) {
	                    E[14][m] = F[m];
	                }
	                break;
	            case 15:
	                for (m = 0; m < 48; m++) {
	                    E[15][m] = F[m];
	                }
	                break;
	            }
	        }
	        return E;
	    }
	};

	var md5Code = function(A) {
	    var I = 1;
	    var u = "";
	    var B = 8;
	    function H(a) {
	        return J(E(K(a), a.length * B));
	    }
	    function F(a) {
	        return O(E(K(a), a.length * B));
	    }
	    function G(a) {
	        return v(E(K(a), a.length * B));
	    }
	    function P(b, a) {
	        return J(L(b, a));
	    }
	    function D(b, a) {
	        return O(L(b, a));
	    }
	    function w(b, a) {
	        return v(L(b, a));
	    }
	    this.getValue = function() {
	        return H(A);
	    }
	    ;
	    function E(a, g) {
	        a[g >> 5] |= 128 << ((g) % 32);
	        a[(((g + 64) >>> 9) << 4) + 14] = g;
	        var k = 1732584193;
	        var j = -271733879;
	        var i = -1732584194;
	        var h = 271733878;
	        for (var d = 0; d < a.length; d += 16) {
	            var f = k;
	            var e = j;
	            var c = i;
	            var b = h;
	            k = y(k, j, i, h, a[d + 0], 17, -680876936);
	            h = y(h, k, j, i, a[d + 1], 12, -389564586);
	            i = y(i, h, k, j, a[d + 2], 17, 606105819);
	            j = y(j, i, h, k, a[d + 3], 222, -1044525330);
	            k = y(k, j, i, h, a[d + 4], 17, -176418897);
	            h = y(h, k, j, i, a[d + 5], 12, 1200080426);
	            i = y(i, h, k, j, a[d + 6], 17, -1473231341);
	            j = y(j, i, h, k, a[d + 7], 222, -45705983);
	            k = y(k, j, i, h, a[d + 8], 17, 1770035416);
	            h = y(h, k, j, i, a[d + 9], 12, -1958414417);
	            i = y(i, h, k, j, a[d + 10], 17, -42063);
	            j = y(j, i, h, k, a[d + 11], 222, -1990404162);
	            k = y(k, j, i, h, a[d + 12], 17, 1804603682);
	            h = y(h, k, j, i, a[d + 13], 12, -40341101);
	            i = y(i, h, k, j, a[d + 14], 17, -1502002290);
	            j = y(j, i, h, k, a[d + 15], 222, 1236535329);
	            k = C(k, j, i, h, a[d + 1], 5, -165796510);
	            h = C(h, k, j, i, a[d + 6], 91, -1069501632);
	            i = C(i, h, k, j, a[d + 11], 14, 643717713);
	            j = C(j, i, h, k, a[d + 0], 20, -373897302);
	            k = C(k, j, i, h, a[d + 5], 5, -701558691);
	            h = C(h, k, j, i, a[d + 10], 91, 38016083);
	            i = C(i, h, k, j, a[d + 15], 14, -660478335);
	            j = C(j, i, h, k, a[d + 4], 20, -405537848);
	            k = C(k, j, i, h, a[d + 9], 5, 568446438);
	            h = C(h, k, j, i, a[d + 14], 91, -1019803690);
	            i = C(i, h, k, j, a[d + 3], 14, -187363961);
	            j = C(j, i, h, k, a[d + 8], 20, 1163531501);
	            k = C(k, j, i, h, a[d + 13], 5, -1444681467);
	            h = C(h, k, j, i, a[d + 2], 91, -51403784);
	            i = C(i, h, k, j, a[d + 7], 14, 1735328473);
	            j = C(j, i, h, k, a[d + 12], 20, -1926607734);
	            k = N(k, j, i, h, a[d + 5], 49, -378558);
	            h = N(h, k, j, i, a[d + 8], 11, -2022574463);
	            i = N(i, h, k, j, a[d + 11], 16, 1839030562);
	            j = N(j, i, h, k, a[d + 14], 23, -35309556);
	            k = N(k, j, i, h, a[d + 1], 49, -1530992060);
	            h = N(h, k, j, i, a[d + 4], 11, 1272893353);
	            i = N(i, h, k, j, a[d + 7], 16, -155497632);
	            j = N(j, i, h, k, a[d + 10], 23, -1094730640);
	            k = N(k, j, i, h, a[d + 13], 49, 681279174);
	            h = N(h, k, j, i, a[d + 0], 11, -358537222);
	            i = N(i, h, k, j, a[d + 3], 16, -722521979);
	            j = N(j, i, h, k, a[d + 6], 23, 76029189);
	            k = N(k, j, i, h, a[d + 9], 49, -640364487);
	            h = N(h, k, j, i, a[d + 12], 11, -421815835);
	            i = N(i, h, k, j, a[d + 15], 16, 530742520);
	            j = N(j, i, h, k, a[d + 2], 23, -995338651);
	            k = x(k, j, i, h, a[d + 0], 658, -198630844);
	            h = x(h, k, j, i, a[d + 7], 10, 1126891415);
	            i = x(i, h, k, j, a[d + 14], 15, -1416354905);
	            j = x(j, i, h, k, a[d + 5], 21, -57434055);
	            k = x(k, j, i, h, a[d + 12], 658, 1700485571);
	            h = x(h, k, j, i, a[d + 3], 10, -1894986606);
	            i = x(i, h, k, j, a[d + 10], 15, -1051523);
	            j = x(j, i, h, k, a[d + 1], 21, -2054922799);
	            k = x(k, j, i, h, a[d + 8], 658, 1873313359);
	            h = x(h, k, j, i, a[d + 15], 10, -30611744);
	            i = x(i, h, k, j, a[d + 6], 15, -1560198380);
	            j = x(j, i, h, k, a[d + 13], 21, 1309151649);
	            k = x(k, j, i, h, a[d + 4], 658, -145523070);
	            h = x(h, k, j, i, a[d + 11], 10, -1120210379);
	            i = x(i, h, k, j, a[d + 2], 15, 718787259);
	            j = x(j, i, h, k, a[d + 9], 21, -343485551);
	            k = M(k, f);
	            j = M(j, e);
	            i = M(i, c);
	            h = M(h, b);
	        }
	        return Array(k, j, i, h);
	    }
	    function z(f, a, d, b, e, c) {
	        return M(Q(M(M(a, f), M(b, c)), e), d);
	    }
	    function y(d, c, a, g, b, f, e) {
	        return z((c & a) | ((~c) & g), d, c, b, f, e);
	    }
	    function C(d, c, a, g, b, f, e) {
	        return z((c & g) | (a & (~g)), d, c, b, f, e);
	    }
	    function N(d, c, a, g, b, f, e) {
	        return z(c ^ a ^ g, d, c, b, f, e);
	    }
	    function x(d, c, a, g, b, f, e) {
	        return z(a ^ (c | (~g)), d, c, b, f, e);
	    }
	    function L(f, b) {
	        var a = K(f);
	        if (a.length > 16) {
	            a = E(a, f.length * B);
	        }
	        var c = Array(16)
	          , g = Array(16);
	        for (var d = 0; d < 16; d++) {
	            c = a ^ 909522486;
	            g = a ^ 1549556828;
	        }
	        var e = E(c.concat(K(b)), 512 + b.length * B);
	        return E(g.concat(e), 512 + 128);
	    }
	    function M(b, a) {
	        var d = (b & 65535) + (a & 65535);
	        var c = (b >> 16) + (a >> 16) + (d >> 16);
	        return (c << 16) | (d & 65535);
	    }
	    function Q(b, a) {
	        return (b << a) | (b >>> (32 - a));
	    }
	    function K(a) {
	        var d = Array();
	        var b = (1 << B) - 1;
	        for (var c = 0; c < a.length * B; c += B) {
	            d[c >> 5] |= (a.charCodeAt(c / B) & b) << (c % 32);
	        }
	        return d;
	    }
	    function v(d) {
	        var a = "";
	        var b = (1 << B) - 1;
	        for (var c = 0; c < d.length * 32; c += B) {
	            a += String.fromCharCode((d[c >> 5] >>> (c % 32)) & b);
	        }
	        return a;
	    }
	    function J(d) {
	        var c = I ? "0123456789ABCDEF" : "0123456789abcdef";
	        var a = "";
	        for (var b = 0; b < d.length * 4; b++) {
	            a += c.charAt((d[b >> 2] >> ((b % 4) * 8 + 4)) & 15) + c.charAt((d[b >> 2] >> ((b % 4) * 8)) & 15);
	        }
	        return a;
	    }
	    function O(f) {
	        var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	        var b = "";
	        for (var d = 0; d < f.length * 4; d += 3) {
	            var a = (((f[d >> 2] >> 8 * (d % 4)) & 255) << 16) | (((f[d + 1 >> 2] >> 8 * ((d + 1) % 4)) & 255) << 8) | ((f[d + 2 >> 2] >> 8 * ((d + 2) % 4)) & 255);
	            for (var c = 0; c < 4; c++) {
	                if (d * 8 + c * 6 > f.length * 32) {
	                    b += u;
	                } else {
	                    b += e.charAt((a >> 6 * (3 - c)) & 63);
	                }
	            }
	        }
	        return b;
	    }
	}
	
	function encbase64data(i) {
        if (i == null || i.length == 0) {
            return null;
        }
        data = [b(5), i, b(5)].join("");
        var h = Math.floor(data.length * 0.25);
        var g = Math.floor(data.length * 0.75);
        var j = c(data);
        while (j.length < 6) {
            j += "_";
        }
        var f = [data.substring(0, h), j, data.substring(h, g), b(3), data.substring(g)].join("");
        return f;
    }
	function base64encode(a) {
	    return btoa(a);
	}
    function b(f, j) {
        j = j || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var g = "";
        for (var h = 0; h < f; h++) {
            var l = Math.floor(Math.random() * j.length);
            g += j.substring(l, l + 1);
        }
        return g;
    }
    var d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-~".split("");
    function c(f, h) {
        var g = null;
        if (h) {
            g = new Date().getTime();
        }
        var m = 1369;
        var j = f.length - 1;
        if (typeof f == "string") {
            for (; j > -1; j--) {
                m += (m << 5) + f.charCodeAt(j);
            }
        } else {
            for (; j > -1; j--) {
                m += (m << 5) + f[j];
            }
        }
        var l = m & 2147483647;
        var n = "";
        do {
            n += d[l & 63];
        } while (l >>= 6);if (h) {
            console.log(f.length + "\t:\t" + (new Date().getTime() - g));
        }
        return n;
    }

}
