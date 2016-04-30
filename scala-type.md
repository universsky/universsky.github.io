# Scala类型推导

之剑 

2016.5.1 00:38:12



## 类型系统



### 什么是静态类型？为什么它们很有用？

根据Picrce的说法：“类型系统是一个可以根据代码段计算出来的值对它们进行分类，然后通过语法的手段来自动检测程序错误的系统。”

类型可以让你表示函数的域和值域。例如，在数学里，我们经常看到下面的函数：

```

f: R -> N

```

这个定义告诉我们函数”f”的作用是把实数集里的数映射到自然集里。

抽象地说，这才是具体意义上的类型。类型系统给了我们一些表示这些集合的更强大的方式。

有了这些类型标识，编译器现在可以 静态地(在编译期)判断这个程序是正确的。

换句话说，如果一个值（在运行期）不能够满足程序里的限制条件的话，那么在编译期就会出错。

通常来说，类型检测器(typechecker)只能够保证不正确的的程序不能通过编译。但是，它不能够保证所有正确的程序都能通过编译。

由于类型系统的表达能力不断增加，使得我们能够生成出更加可靠的代码，因为它使得我们能够控制程序上的不可变，即是是程序还没有运行的情况下（在类型上限制bug的出现）。学术界一直在努力突破类型系统的表达能力的极限，包含值相关的类型。



注意，所有的类型信息都会在编译期擦除。后面不再需要。这个被称为类型擦除。比如,Java里面的泛型的实现.

 
### Scala中的类型

Scala强大的类型系统让我们可以使用更具有表现力的表达式。一些主要的特点如下：


* 支持参数多态，泛型编程

* 支持（局部）类型推导，这就是你为什么不需要写val i: Int = 12: Int

* 支持存在向量(existential quantification)，给一些没有名称的类型定义一些操作

* 支持视图。 给定的值从一个类型到其他类型的“可转换性”



 
## 参数多态

多态可以用来编写泛型代码（用于处理不同类型的值)，并且不会减少静态类型的表达能力。

例如，没有参数多态的话，一个泛型的列表数据结构通常会是下面这样的写法（在Java还没有泛型的时候，确实是这样的）：

```

scala> 2 :: 1 :: "bar" :: "foo" :: Nil

res5: List[Any] = List(2, 1, bar, foo)



```



这样的话，我们就不能够恢复每个元素的类型信息。

```

scala> res5.head

res6: Any = 2

```

这样一来，我们的应用里会包含一系列的类型转换(“asInstanceOf[]“)，代码会缺少类型安全（因为他们都是动态类型的）。

多态是通过指定类型变量来达到的。

```

scala> def drop1[A](l: List[A]) = l.tail

drop1: [A](l: List[A])List[A]

 

scala> drop1(List(1,2,3))

res1: List[Int] = List(2, 3)

```

 
### 多态是scala里的一等公民

简单来说，这意味着有一些你想在Scala里表达的类型概念会显得“太过于泛型”，从而导致编译器无法理解。所有的类型变量在运行期必须是确定的。

 
对于静态类型的一个比较常见的缺陷就是有太多的类型语法。Scala提供了类型推导来解决这个问题。

函数式语言里比较经典的类型推导的方法是 Hindlry-Milner，并且它是在ML里首先使用的。

Scala的类型推导有一点点不同，不过思想上是一致的：推导所有的约束条件，然后统一到一个类型上。

在Scala里，例如，你不能这样写：

```

scala> { x => x }

:7: error: missing parameter type

       { x => x }


```

但是在OCaml里，你可以:

```

# fun x -> x;;

- : 'a -> 'a =



```



在Scala里，所有的类型推导都是局部的。Scala一次只考虑一个表达式。例如：

```

scala> def id[T](x: T) = x

id: [T](x: T)T

 

scala> val x = id(322)

x: Int = 322

 

scala> val x = id("hey")

x: java.lang.String = hey

 

scala> val x = id(Array(1,2,3,4))

x: Array[Int] = Array(1, 2, 3, 4)



```

在这里，类型都被隐藏了。Scala编译器自动推导参数的类型。注意我们也没有必要显示指定返回值的类型了。

 
### 型变



Scala的类型系统需要把类的继承关系和多态结合起来。类的继承使得类之间存在父子的关系。当把面向对象和多态结合在一起时，一个核心的问题就出来了：如果T'是T的子类，那么Container[T']是不是Container[T]的子类呢？Variance注释允许你在类继承和多态类型之间表达下面的这些关系：



<table>
    <tr>
        <td></td><td>含义</td><td>Scala中的标记</td>
    </tr>
    <tr>
        <td>covariant(协变)</td><td> C[T’]是C[T]的子类</td><td>[+T]</td>
    </tr>
    <tr>
        <td>contravariant(逆变)</td><td>C[T]是C[T’]子类</td><td>[-T]</td>
    </tr>
    <tr>
        <td>invariant(不变)</td><td> C[T]和C[T’]不相关</td><td>[T]</td>
    </tr>
</table>



子类关系的真正意思是：对于一个给定的类型T，如果T’是它的子类，那么T’可以代替T吗？



```

scala> class Contravariant[-A]

defined class Contravariant

 

scala> val cv: Contravariant[String] = new Contravariant[AnyRef]

cv: Contravariant[AnyRef] = Contravariant@49fa7ba

 

scala> val fail: Contravariant[AnyRef] = new Contravariant[String]

:6: error: type mismatch;

 found   : Contravariant[String]

 required: Contravariant[AnyRef]

       val fail: Contravariant[AnyRef] = new Contravariant[String]     



```

 
### 量化（Quantification）

有时候你不需要给一个类型变量以名称，例如

```

scala> def count[A](l: List[A]) = l.size

count: [A](List[A])Int


```

你可以用“通配符”来替代：



```

scala> def count(l: List[_]) = l.size

count: (List[_])Int

```





## 什么是类型推导



先看个代码：

```
Map<Integer, Map<String, String>> m = new HashMap<Integer, Map<String, String>>(); 

```
是啊, 这简直太长了,我们不禁感叹,这编译器也太愚蠢了.几乎一半字符都是重复的!

针对泛型定义和实例太过繁琐的问题,在java 7 中引入了钻石运算符. 神奇的Coin项目,满足了你的心愿.

于是,你在java 7之后可以这样写了:

```

Map<Integer, Map<String, String>> m = new HashMap(); 

```



钻石运算符通常用于简化创建带有泛型对象的代码，可以避免运行时 的异常，并且它不再要求程序员在编码时显示书写冗余的类型参数。实际上，编译器在进行词法解析时会自动推导类型，自动为代码进行补全，并且编译的字节码与 以前无异。

当时在提案中,这个问题叫"Improved Type Inference for Generic Instance Creation",缩写ITIGIX听起来怪怪的,但是为啥叫钻石算法? 世界上, 哪有那么多为什么.



Scala正是因为做了类型推导, 让Coders感觉仿佛在写动态语言的代码.



在Scala中,高阶函数经常传递匿名函数.举个栗子:

一段定义泛型函数的代码

```

def dropWhile[A](list: List[A], f: A => Boolean): List[A]

```

当我们传入一个匿名函数f来调用它,

```

val mylist: List[Int] = List(1,2,3,4,5) 

val listDropped = dropWhile( mylist, (x: Int) => x < 4 )

```

listDropped的值是List(4,5)

我们用大脑可以轻易判断, 当list: List[A] 中的类型A在mylist声明的时候已经指定了Int, 那么很明显, 在第二个参数中,我们的x也必是Int. 



很幸运Scala设计者们早已考虑到这一点,Scala编译器可以推导这种情况.但是你得按照Scala的规范限制来写你的dropWhile函数的签名(柯里化的): dropWhile( mylist )( f )



```

def dropWhile[A] ( list: List[A] ) ( f: A => Boolean ) : List[A] = list match {

case Cons(h,t) if f(h) => dropWhile(t)(f)

case _ => list

}

```



如此而来,我们就可以直接像下面这样使用这个函数了:



```

val mylist: List[Int] = List(1,2,3,4,5)

val droppedList = dropWhile( mylist ) ( x => x < 4 )

```

注意, x参数没有指定Int类型, 因为编译器直接通过mylist的泛型信息Int推导出x的类型也是Int.





类型推导是一门博大的学问，背后有繁冗的理论, 这在编译器设计开发的时候需要解决的问题.



|Scala|Haskell,ML|

|---------|--------|

|局部的(local)、基于流的(flow-based)类型推断|全局化的Hindley-Milner类型推断|



在《Programming in Scala》一书中提到基于流的类型推断有它的局限性，但是对于面向对象的分支类型处理比Hindley-Mlner更加优雅。

基于流的类型推导在偏应用函数场景下，不能对参数类型省略



## 类型推导算法



类型推导（Type Inference）是现代高级语言中一个越来越常见的特性。其实，这个特性在函数式语言

中早有了广泛应用。而HindleyMilner推导器是所有类型推导器的基础。



Scala实现的一个简单的HindleyMilner推导器:



```

    /*

     * http://dysphoria.net/code/hindley-milner/HindleyMilner.scala

     * Andrew Forrest

     *

     * Implementation of basic polymorphic type-checking for a simple language.

     * Based heavily on Nikita Borisov’s Perl implementation at

     * http://web.archive.org/web/20050420002559/www.cs.berkeley.edu/~nikitab/courses/cs263/hm.html

     * which in turn is based on the paper by Luca Cardelli at

     * http://lucacardelli.name/Papers/BasicTypechecking.pdf

     *

     * If you run it with "scala HindleyMilner.scala" it will attempt to report the types

     * for a few example expressions. (It uses UTF-8 for output, so you may need to set your

     * terminal accordingly.)

     *

     * Changes

     * June 30, 2011 by Liang Kun(liangkun(AT)baidu.com)

     * 1. Modify to enhance readability

     * 2. Extend to Support if expression in syntax

     *

     *

     *

     * Do with it what you will. :)

     */



    /** Syntax definition. This is a simple lambda calculous syntax.

     * Expression ::= Identifier

     * | Constant

     * | "if" Expression "then" Expression "else" Expression

     * | "lambda(" Identifier ") " Expression

     * | Expression "(" Expression ")"

     * | "let" Identifier "=" Expression "in" Expression

     * | "letrec" Identifier "=" Expression "in" Expression

     * | "(" Expression ")"

     * See the examples below in main function.

     */

    sealed abstract class Expression



    case class Identifier(name: String) extends Expression {

        override def toString = name

    }



    case class Constant(value: String) extends Expression {

        override def toString = value

    }



    case class If(condition: Expression, then: Expression, other: Expression) extends Expression {

        override def toString = "(if " + condition + " then " + then + " else " + other + ")"

    }



    case class Lambda(argument: Identifier, body: Expression) extends Expression {

        override def toString = "(lambda " + argument + " → " + body + ")"

    }



    case class Apply(function: Expression, argument: Expression) extends Expression {

        override def toString = "(" + function + " " + argument + ")"

    }



    case class Let(binding: Identifier, definition: Expression, body: Expression) extends Expression {

        override def toString = "(let " + binding + " = " + definition + " in " + body + ")"

    }



    case class Letrec(binding: Identifier, definition: Expression, body: Expression) extends Expression {

        override def toString = "(letrec " + binding + " = " + definition + " in " + body + ")"

    }





    /** Exceptions may happened */

    class TypeError(msg: String) extends Exception(msg)

    class ParseError(msg: String) extends Exception(msg)





    /** Type inference system */

    object TypeSystem {

        type Env = Map[Identifier, Type]

        val EmptyEnv: Map[Identifier, Type] = Map.empty



        // type variable and type operator

        sealed abstract class Type

        case class Variable(id: Int) extends Type {

            var instance: Option[Type] = None

            lazy val name = nextUniqueName()



            override def toString = instance match {

                case Some(t) => t.toString

                case None => name

            }

        }



        case class Operator(name: String, args: Seq[Type]) extends Type {

            override def toString = {

                if (args.length == 0)

                    name

                else if (args.length == 2)

                    "[" + args(0) + " " + name + " " + args(1) + "]"

                else

                    args.mkString(name + "[", ", ", "]")

            }

        }



        // builtin types, types can be extended by environment

        def Function(from: Type, to: Type) = Operator("→", Array(from, to))

        val Integer = Operator("Integer", Array[Type]())

        val Boolean = Operator("Boolean", Array[Type]())





        protected var _nextVariableName = 'α';

        protected def nextUniqueName() = {

            val result = _nextVariableName

            _nextVariableName = (_nextVariableName.toInt + 1).toChar

            result.toString

        }

        protected var _nextVariableId = 0

        def newVariable(): Variable = {

            val result = _nextVariableId

            _nextVariableId += 1

            Variable(result)

        }





        // main entry point

        def analyze(expr: Expression, env: Env): Type = analyze(expr, env, Set.empty)

        def analyze(expr: Expression, env: Env, nongeneric: Set[Variable]): Type = expr match {

            case i: Identifier => getIdentifierType(i, env, nongeneric)



            case Constant(value) => getConstantType(value)



            case If(cond, then, other) => {

                val condType = analyze(cond, env, nongeneric)

                val thenType = analyze(then, env, nongeneric)

                val otherType = analyze(other, env, nongeneric)

                unify(condType, Boolean)

                unify(thenType, otherType)

                thenType

            }



            case Apply(func, arg) => {

                val funcType = analyze(func, env, nongeneric)

                val argType = analyze(arg, env, nongeneric)

                val resultType = newVariable()

                unify(Function(argType, resultType), funcType)

                resultType

            }



            case Lambda(arg, body) => {

                val argType = newVariable()

                val resultType = analyze(body,

                                         env + (arg -> argType),

                                         nongeneric + argType)

                Function(argType, resultType)

            }



            case Let(binding, definition, body) => {

                val definitionType = analyze(definition, env, nongeneric)

                val newEnv = env + (binding -> definitionType)

                analyze(body, newEnv, nongeneric)

            }



            case Letrec(binding, definition, body) => {

                val newType = newVariable()

                val newEnv = env + (binding -> newType)

                val definitionType = analyze(definition, newEnv, nongeneric + newType)

                unify(newType, definitionType)

                analyze(body, newEnv, nongeneric)

            }

        }



        protected def getIdentifierType(id: Identifier, env: Env, nongeneric: Set[Variable]): Type = {

            if (env.contains(id))

                fresh(env(id), nongeneric)

            else

                throw new ParseError("Undefined symbol: " + id)

        }



        protected def getConstantType(value: String): Type = {

            if(isIntegerLiteral(value))

                Integer

            else

                throw new ParseError("Undefined symbol: " + value)

        }



        protected def fresh(t: Type, nongeneric: Set[Variable]) = {

            import scala.collection.mutable

            val mappings = new mutable.HashMap[Variable, Variable]

            def freshrec(tp: Type): Type = {

                prune(tp) match {

                    case v: Variable =>

                        if (isgeneric(v, nongeneric))

                            mappings.getOrElseUpdate(v, newVariable())

                        else

                            v



                    case Operator(name, args) =>

                        Operator(name, args.map(freshrec(_)))

                }

            }



            freshrec(t)

        }



        protected def unify(t1: Type, t2: Type) {

            val type1 = prune(t1)

            val type2 = prune(t2)

            (type1, type2) match {

                case (a: Variable, b) => if (a != b) {

                    if (occursintype(a, b))

                        throw new TypeError("Recursive unification")

                    a.instance = Some(b)

                }

                case (a: Operator, b: Variable) => unify(b, a)

                case (a: Operator, b: Operator) => {

                    if (a.name != b.name ||

                        a.args.length != b.args.length) throw new TypeError("Type mismatch: " + a + " ≠ " + b)

                    

                    for(i <- 0 until a.args.length)

                        unify(a.args(i), b.args(i))

                }

            }

        }



        // Returns the currently defining instance of t.

        // As a side effect, collapses the list of type instances.

        protected def prune(t: Type): Type = t match {

            case v: Variable if v.instance.isDefined => {

                val inst = prune(v.instance.get)

                v.instance = Some(inst)

                inst

            }

            case _ => t

        }



        // Note: must be called with v 'pre-pruned'

        protected def isgeneric(v: Variable, nongeneric: Set[Variable]) = !(occursin(v, nongeneric))



        // Note: must be called with v 'pre-pruned'

        protected def occursintype(v: Variable, type2: Type): Boolean = {

            prune(type2) match {

                case `v` => true

                case Operator(name, args) => occursin(v, args)

                case _ => false

            }

        }



        protected def occursin(t: Variable, list: Iterable[Type]) =

            list exists (t2 => occursintype(t, t2))



        protected val checkDigits = "^(\\d+)$".r

        protected def isIntegerLiteral(name: String) = checkDigits.findFirstIn(name).isDefined

    }





    /** Demo program */

    object HindleyMilner {

        def main(args: Array[String]){

            Console.setOut(new java.io.PrintStream(Console.out, true, "utf-8"))



            // extends the system with a new type[pair] and some builtin functions

            val left = TypeSystem.newVariable()

            val right = TypeSystem.newVariable()

            val pairType = TypeSystem.Operator("×", Array(left, right))



            val myenv: TypeSystem.Env = TypeSystem.EmptyEnv ++ Array(

                Identifier("pair") -> TypeSystem.Function(left, TypeSystem.Function(right, pairType)),

                Identifier("true") -> TypeSystem.Boolean,

                Identifier("false")-> TypeSystem.Boolean,

                Identifier("zero") -> TypeSystem.Function(TypeSystem.Integer, TypeSystem.Boolean),

                Identifier("pred") -> TypeSystem.Function(TypeSystem.Integer, TypeSystem.Integer),

                Identifier("times")-> TypeSystem.Function(TypeSystem.Integer,

                        TypeSystem.Function(TypeSystem.Integer, TypeSystem.Integer))

            )



            // example expressions

            val pair = Apply(

                Apply(

                    Identifier("pair"), Apply(Identifier("f"), Constant("4"))

                ),

                Apply(Identifier("f"), Identifier("true"))

            )

            val examples = Array[Expression](

                // factorial

                Letrec(Identifier("factorial"), // letrec factorial =

                    Lambda(Identifier("n"), // lambda n =>

                        If(

                            Apply(Identifier("zero"), Identifier("n")),



                            Constant("1"),



                            Apply(

                                Apply(Identifier("times"), Identifier("n")),

                                Apply(

                                    Identifier("factorial"),

                                    Apply(Identifier("pred"), Identifier("n"))

                                )

                            )

                        )

                    ), // in

                    Apply(Identifier("factorial"), Constant("5"))

                ),



                // Should fail:

                // fn x => (pair(x(3) (x(true))))

                Lambda(Identifier("x"),

                    Apply(

                        Apply(Identifier("pair"),

                            Apply(Identifier("x"), Constant("3"))

                        ),

                        Apply(Identifier("x"), Identifier("true"))

                    )

                ),



                // pair(f(3), f(true))

                Apply(

                    Apply(Identifier("pair"), Apply(Identifier("f"), Constant("4"))),

                    Apply(Identifier("f"), Identifier("true"))

                ),





                // letrec f = (fn x => x) in ((pair (f 4)) (f true))

                Let(Identifier("f"), Lambda(Identifier("x"), Identifier("x")), pair),



                // Should fail:

                // fn f => f f

                Lambda(Identifier("f"), Apply(Identifier("f"), Identifier("f"))),



                // let g = fn f => 5 in g g

                Let(

                    Identifier("g"),

                    Lambda(Identifier("f"), Constant("5")),

                    Apply(Identifier("g"), Identifier("g"))

                ),



                // example that demonstrates generic and non-generic variables:

                // fn g => let f = fn x => g in pair (f 3, f true)

                Lambda(Identifier("g"),

                    Let(Identifier("f"),

                        Lambda(Identifier("x"), Identifier("g")),

                        Apply(

                            Apply(Identifier("pair"),

                                  Apply(Identifier("f"), Constant("3"))

                            ),

                            Apply(Identifier("f"), Identifier("true"))

                        )

                    )

                ),



                // Function composition

                // fn f (fn g (fn arg (f g arg)))

                Lambda( Identifier("f"),

                    Lambda( Identifier("g"),

                        Lambda( Identifier("arg"),

                            Apply(Identifier("g"), Apply(Identifier("f"), Identifier("arg")))

                        )

                    )

                )

            )



            for(eg <- examples){

                tryexp(myenv, eg)

            }

        }



        def tryexp(env: TypeSystem.Env, expr: Expression) {

            try {

                val t = TypeSystem.analyze(expr, env)

                print(t)



            }catch{

                case t: ParseError => print(t.getMessage)

                case t: TypeError => print(t.getMessage)

            }

            println(":\t" + expr)

        }

    }



    HindleyMilner.main(argv)

```





Haskell写的一个 合一算法的简单实现:

https://github.com/yihuang/haskell-snippets/blob/master/Unif.hs



```                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 

module Main where    



import Data.List (intersperse)    

import Control.Monad    



-- utils --    



mapFst :: (a -> b) -> (a, c) -> (b,   c)    

mapFst    f           (a, c) =  (f a, c)    



-- types --    



type Name = String    



data Term = Var Name    

         | App Name [Term]    



-- 表示一个替换关系    

type Sub = (Term, Name)    



-- implementation --    



-- 检查变量 Name 是否出现在 Term 中    

occurs :: Name -> Term -> Bool    

occurs x t = case t of    

 (Var y)    -> x==y    

 (App _ ts) -> and . map (occurs x) $ ts    



-- 使用 Sub 对 Term 进行替换    

sub :: Sub -> Term -> Term    

sub (t1, y) t@(Var a)    

 | a==y      = t1    

 | otherwise = t    

sub s (App f ts) = App f $ map (sub s) ts    



-- 使用 Sub 列表对 Term 进行替换    

subs :: [Sub] -> Term -> Term    

subs ss t = foldl (flip sub) t ss    



-- 把两个替换列表组合起来，同时用新加入的替换对其中所有 Term 进行替换    

compose :: [Sub] -> [Sub] -> [Sub]    

compose []     s1 = s1    

compose (s:ss) s1 = compose ss $ s : iter s s1    

 where    

   iter :: Sub -> [Sub] -> [Sub]    

   iter s ss = map (mapFst (sub s)) ss    



-- 合一函数    

unify :: Term -> Term -> Maybe [Sub]    

unify t1 t2 = case (t1, t2) of    

 (Var x,   Var y)   -> if x==y        then Just [] else Just [(t1, y)]    

 (Var x,   App _ _) -> if occurs x t2 then Nothing else Just [(t2, x)]    

 (App _ _, Var x)   -> if occurs x t1 then Nothing else Just [(t1, x)]    

 (App n1 ts1, App n2 ts2)    

                    -> if n1/=n2      then Nothing else unify_args ts1 ts2    

 where    

   unify_args [] [] = Just []    

   unify_args _  [] = Nothing    

   unify_args [] _  = Nothing    

   unify_args (t1:ts1) (t2:ts2) = do    

     u <- unify t1 t2    

     let update = map (subs u)    

     u1 <- unify_args (update ts1) (update ts2)    

     return (u1 `compose` u)    



-- display --    



instance Show Term where    

   show (Var s) = s    

   show (App name ts) = name++"("++(concat . intersperse "," $ (map show ts))++")"    



showSub (t, s) = s ++ " -> " ++ show t    



-- test cases --    



a = Var "a"    

b = Var "b"    

c = Var "c"    

d = Var "d"    

x = Var "x"    

y = Var "y"    

z = Var "z"    

f = App "f"    

g = App "g"    

j = App "j"    



test t1 t2 = do    

   putStrLn $ show t1 ++ "  <==>  " ++ show t2    

   case unify t1 t2 of    

     Nothing -> putStrLn "unify fail"    

     Just u  -> putStrLn $ concat . intersperse "\n" $ map showSub u    



testcases = [(j [x,y,z],    

             j [f [y,y], f [z,z], f [a,a]])    

           ,(x,    

             f [x])    

           ,(f [x],    

             y)    

           ,(f [a, f [b, c], g [b, a, c]],    

             f [a, a, x])    

           ,(f [d, d, x],    

             f [a, f [b, c], f [b, a, c]])    

           ]    



main = forM testcases (uncurry test)    

```



