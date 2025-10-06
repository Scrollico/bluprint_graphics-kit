<!--
  GlobalSolutionsChart.svelte
  Purpose: Visual representation of global solutions for metro suicide prevention
  Usage: Shows different prevention methods with effectiveness indicators
-->

<script lang="ts">
  export let title: string = 'Metro İntiharlarını Önleme Yöntemleri';
  export const width: number = 900;
  export const height: number = 600;

  // Global solutions data with effectiveness ratings
  const solutionsData = [
    {
      category: 'Fiziksel Önlemler',
      solutions: [
        {
          name: 'Platform Kapıları',
          effectiveness: 95,
          cities: ['Tokyo', 'Seul', 'Paris', 'Londra'],
          color: '#e74c3c',
        },
        {
          name: 'Mavi LED Aydınlatma',
          effectiveness: 84,
          cities: ['Tokyo', 'Glasgow'],
          color: '#3498db',
        },
        {
          name: 'Ray Altı Güvenlik Alanları',
          effectiveness: 70,
          cities: ['Münih', 'Viyana'],
          color: '#2ecc71',
        },
      ],
    },
    {
      category: 'Teknolojik Çözümler',
      solutions: [
        {
          name: 'Yapay Zeka Gözetim',
          effectiveness: 80,
          cities: ['Singapur', 'Hong Kong'],
          color: '#9b59b6',
        },
        {
          name: 'Davranış Analizi',
          effectiveness: 75,
          cities: ['New York', 'Londra'],
          color: '#f39c12',
        },
        {
          name: 'Anlık Uyarı Sistemleri',
          effectiveness: 65,
          cities: ['Berlin', 'Amsterdam'],
          color: '#1abc9c',
        },
      ],
    },
    {
      category: 'Psikososyal Destek',
      solutions: [
        {
          name: 'Kriz Müdahale Ekipleri',
          effectiveness: 60,
          cities: ['Toronto', 'Melbourne'],
          color: '#34495e',
        },
        {
          name: 'Ücretsiz Yardım Hatları',
          effectiveness: 55,
          cities: ['Sydney', 'Vancouver'],
          color: '#e67e22',
        },
        {
          name: 'Personel Eğitimi',
          effectiveness: 50,
          cities: ['Stockholm', 'Kopenhag'],
          color: '#27ae60',
        },
      ],
    },
  ];
</script>

<div class="layercake-chart global-solutions-chart">
  <div class="chart-header">
    <h3 class="chart-title">{title}</h3>
    <p class="chart-subtitle">
      Dünya metropollerinde uygulanan etkili önleme yöntemleri
    </p>
  </div>

  <div class="solutions-grid">
    {#each solutionsData as category}
      <div class="category-section">
        <h4 class="category-title">{category.category}</h4>
        <div class="solutions-list">
          {#each category.solutions as solution}
            <div class="solution-item">
              <div class="solution-header">
                <span class="solution-name">{solution.name}</span>
                <span
                  class="effectiveness-badge"
                  style="background-color: {solution.color}"
                >
                  %{solution.effectiveness} etkili
                </span>
              </div>
              <div class="effectiveness-bar">
                <div
                  class="effectiveness-fill"
                  style="width: {solution.effectiveness}%; background-color: {solution.color}"
                ></div>
              </div>
              <div class="cities-list">
                <span class="cities-label">Uygulandığı şehirler:</span>
                <span class="cities">{solution.cities.join(', ')}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="chart-footer">
    <p class="source-note">
      * Etkililik oranları bilimsel araştırmalara dayanmaktadır. Kaynak: WHO,
      UIC, Metro Research Institute
    </p>
  </div>
</div>

<style>
  .layercake-chart {
    background: transparent;
    box-shadow: none;
    font-family:
      'DIN Pro',
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      sans-serif;
    padding: 20px;
  }

  .chart-header {
    text-align: center;
    margin-bottom: 30px;
  }

  .chart-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
  }

  .chart-subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
  }

  .solutions-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .category-section {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .category-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0 0 20px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #e0e0e0;
  }

  .solutions-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .solution-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 15px;
    transition: all 0.3s ease;
  }

  .solution-item:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  .solution-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .solution-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .effectiveness-badge {
    font-size: 12px;
    font-weight: 600;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
  }

  .effectiveness-bar {
    width: 100%;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .effectiveness-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.8s ease;
  }

  .cities-list {
    font-size: 12px;
    color: #666;
  }

  .cities-label {
    font-weight: 600;
  }

  .cities {
    margin-left: 5px;
  }

  .chart-footer {
    margin-top: 30px;
    text-align: center;
  }

  .source-note {
    font-size: 11px;
    color: #888;
    font-style: italic;
    margin: 0;
  }

  @media (max-width: 768px) {
    .solutions-grid {
      grid-template-columns: 1fr;
    }

    .solution-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
</style>
