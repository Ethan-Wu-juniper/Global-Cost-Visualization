# Cost of Living Visualization
> 0816004 吳原博、0816102 陳品戎

## Dataset

這次的作業主要由兩個資料集組成，分別是 cost of living index 和 cost of living。

### [Cost of Living Index](https://www.kaggle.com/datasets/ankanhore545/cost-of-living-index-2022)
代表各國家相對於紐約在各項花費的昂貴程度或是消費能力，包含六個 column，如果一個國家的 index 是 120，則代表在當地平均花費（或是消費能力）高於紐約 20%。

### [Cost of Living](https://www.kaggle.com/datasets/mvieira101/global-cost-of-living)
包含各國家主要城市在各種花費以及薪資的統計資料，包含 56 個 column，並且根據資料特徵可以再被分為十個群組。每筆資料都有被標注其可信程度，我們過濾掉可信度低的資料進行視覺化。

### Additional Data
- 世界地圖向量資料 : 參考 [Github](https://gist.github.com/almccon/6ab03506d2e3ff9d843f69fa2d5c29cf), [Geojson File](http://enjalot.github.io/wwsd/data/world/world-110m.geojson)
- 城市座標資料 : [Natural Earth - Populated Places](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-populated-places/), 以 [mapshaper](https://mapshaper.org/) 轉換成 geojson 格式
- 國家名稱及縮寫資料 : [country aliases-List of alternative country names](https://www.kaggle.com/datasets/wbdill/country-aliaseslist-of-alternative-country-names?resource=download), 由於不同資料所提供的國家名稱各異，故以此資料集作為輔助來統一國家名稱

## System

### Map
![](https://i.imgur.com/6mujB5n.png)
進入首頁會是以 cost of living index 為基礎繪製出的世界地圖，如果國家的數值越高則會越接近橘紅色，滑鼠移動到過加上方可以檢視詳細資訊。考慮到有時候需要查找較小的國家，使用滾輪可以縮放地圖，使用滑鼠拖曳可以移動畫面。

### Ranking
![](https://i.imgur.com/lw5pxmt.png)
點擊城市 icon 可以看到使用 cost of living 為基礎該城市在全資料集各項花費的排名，排名較高的 column 會標以紅色，反之會標以綠色

### Bar Chart
![](https://i.imgur.com/qmy6cKu.png)
我們使用 bar chart 呈現兩個城市在不同指標上的差異，點擊 icon 就可以加入新的城市，點擊 bar chart 左側的城市名稱可以將其移除。另外，點擊下方的 column name 可以查閱其詳細資料，了解一個 group 裡面包含了哪些資訊。

### Heatmap
![](https://i.imgur.com/7s8K3wP.png)
由於 cost of living 內包含許多各種生活花費的資料，我們對於資料之間的關係感到好奇，因此以 column 之間的 correlation 會製成如下的 heatmap。

## Insight

### 消費能力強的國家，生活花費也高，反之卻未必
![](https://i.imgur.com/lOmkxdz.gif)

從上圖可以發現，多數國家相對於全世界的各項指標的趨勢表較穩定，如果一個國家的平均生活花費較高，它在餐廳、雜貨或是房租的花費以及當地居民的消費能力也會更高。例如北美洲、歐洲和澳洲等經濟較好的國家的顏色普遍偏向橘紅色，相對的南美、中南亞、東歐、非洲普遍偏向綠色。
然而其中也有例外，從下圖中可以看到有些國家即使生活花費較低，人民的消費力仍然很強，代表國家有阿拉伯和南非共和國，前者生產石油，而後者是世界貧富差距最大的國家之一。中國雖然並非相當明顯，但也屬於生活花費低但消費能力較好的國家，這也可能是由於貧富差距所導致。
由於基本上不存在消費力低但生活花費高的國家，消費力的橘紅色區塊明顯較多，且包含生活花費的橘紅色區塊。

![](https://i.imgur.com/BF5NJAU.jpg)

### 特定國家
- 日本、韓國
![](https://i.imgur.com/bytDIPz.jpg)
日韓作為東亞高度發展的國家，不管是生活花費還是消費力都在世界平均之上。不過它們都有個共通點，在資料中日韓的房租都比較便宜，這在其他生活花費高的國家裡是比較罕見的。

- 阿富汗
![](https://i.imgur.com/OfkdqOe.png)

喀布尔是阿富汗的首都，因此資料的可信度應該較高。然而我們卻偶然發現如上圖的奇怪現象，該城市的 utility 位居全資料集最高，但幾乎所有其他數據都是墊底。經過檢查後發現資料中當地的網路費用異常的高，然而上網查詢資料後卻沒有發現相關的訊息，並且在 cost of living index 資料集中，該城市的生活花費也算是相當的低，因此推斷這裡是資料有誤。

- 台灣
![](https://i.imgur.com/x3kMw50.jpg)

我們所居住的台灣在全世界的表現如何呢？放大後會發現，台灣的各項指標在全世界中都算中間值，不特別高也不特別低，在房租和餐廳花費更是低於世界平均。由此可見，身為台灣人還是蠻幸福的。

### Column Relationship

![](https://i.imgur.com/P4LbCOj.png)

透過Correlation Heatmap，可以發現cost of living中絕大部分的column之間皆為正相關，除了Mortgage Interest Rate(抵押貸款利率，x55)多為負相關。另外，我們發現如牛奶價格(x9)、汽車價格(x34, x35)、夏天衣著與運動鞋價格(x45, x46)與其他項目的相關係數都偏低，表示這些的價格都不易由其他的價格來推估或影響。

## Dedication

### 吳原博
- 首頁以及地圖繪製
- 頁面串接
- cost of living index 資料處理
- 國家名稱資料處理

### 陳品戎
- barchart、heatmap
- 頁面串接
- 分析頁面繪製
- cost of living 資料處理