<template>
  <div class="layout">
    <Layout :style="{minHeight:'100vh',background: '#F5F5F5'}">
      <m-header></m-header>
      <Content :style="{padding: 0, minHeight: '280px', width:'62.5%',background: '#fff'}">
        <!--内容-->
        <div class="title-con score-con">
          <h1>
            <span>{{this.$route.query.title}}答案解析</span>
          </h1>
            <div class="que-con jx-que-con" v-for="(item, index) in answerList.explains" :key="index">
                <!--选择题-->
                <dl v-if="item.quesitem.question_type == '2' || item.quesitem.question_type == '1'" class="type-A">
                    <dt>
                      <i>{{index+1}}</i>
                      <span v-html="item.quesitem.question"></span>
                      <span v-if="item.quesitem.question_type == '1'">[单选题]</span>
                      <span v-else>[多选题]</span>
                      <span>（{{item.oldscore}}分）</span>
                    </dt>
                    <dd v-for="(items, i) in JSON.parse(item.quesitem.question_item)" :class="{cur:item.trueanswer.indexOf(i+1) != -1 }" :key="i">
                      {{items.itemname}}
                    </dd>
                    <dd class="news-old">
                        <p>
                          <span class="right">正确答案：</span>{{item.trueanswer | intoLetter}}</p>
                        <p>
                          <span class="you"> 填写答案：</span>
                          <i v-if="item.oldanswer != null && item.oldanswer != ''">{{item.oldanswer | intoLetter}}</i>
                          <i v-else>空</i>
                        </p>
                        <p>
                          <span class="score" >得分：{{item.score}}分 </span>                          
                        </p>
                        <p>
                          <span class="jx" >解析： </span>{{item.quesitem.explain}}
                        </p>
                    </dd>
                </dl>

                <!--填空-->
                <dl v-if="item.quesitem.question_type == '3'||item.quesitem.question_type == '5'" class="type-C">
                    <dt>
                        <i>{{index+1}}</i>
                        <span v-html="item.quesitem.question"></span>
                        <span v-if="item.quesitem.question_type == '3'">[填空题]</span>
                        <span v-else>[问答题]</span>
                          <span>（{{item.oldscore}}分）</span>
                    </dt>
                    <dd class="news-old">
                        <p>
                          <span class="right">正确答案：</span>{{item.trueanswer}}</p>
                        <p>
                          <span class="you"> 填写答案：</span>
                          <i v-if="item.oldanswer != null && item.oldanswer != ''">{{item.oldanswer}}</i>
                          <i v-else>空</i>
                        </p>
                        <p>
                          <span v-if="item.quesitem.question_type == '3'" class="score" >得分：{{item.score}}分 </span>
                          <span v-else class="score" >得分：未判分 </span>
                        </p>
                        <p>
                          <span class="jx" >解析： </span>{{item.quesitem.explain}}
                        </p>
                    </dd>
                </dl>
            </div>
            <div class="img-intor">
                <p v-if="this.answerList.mask==0">
                  该答案解析不包含问答题，其中选择题、填空题得分共为：<span>{{this.answerList.grade}}</span>分 
                </p>
                <p v-else>
                  该考试总得分为：<span>{{this.answerList.grade}}</span>分 
                </p>
            </div>
        </div>
      </Content>
      <m-footer></m-footer>
    </Layout>
  </div>
</template>

<script>
import MHeader from '@/components/header/header.vue'
import MFooter from '@/components/footer/footer.vue'
export default {
  data() {
    return {
      answerList: []
    };
  },
  mounted() {
    this.answerList = this.$route.query.answerList;
    console.log(this.answerList);
  },
  methods:{
    
  },
  filters: {
    // 将字符串数字改成字母
    intoLetter: function(value) {
      var tempArr = [];
      if (value.length > 0 || value.length == 0) {
        for (var x = 0; x < value.length; x++) {
          tempArr.push(String.fromCharCode(64 + parseInt(value.charAt(x))));
        }
        tempArr = tempArr.sort();
        value = tempArr.join("");
        return value;
      } else {
        return value;
      }
    }
  },
  components:{
    MFooter,
    MHeader,
  },
};
</script>
<style scoped>
@import "../../.././assets/css/index.css";
.layout{
  border: 1px solid #d7dde4;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}
jx-que-con dt i.err {
  background: #d84325;
  color: #d84325;
}

.jx-que-con dt i.cur {
  background: #25bb9b;
  color: #25bb9b;
}
.img-intor p span {
  color: #d84325;
  font-size: 35px
}

</style>