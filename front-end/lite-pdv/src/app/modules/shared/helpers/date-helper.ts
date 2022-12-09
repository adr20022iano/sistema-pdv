import {
  addDays,
  addMinutes,
  differenceInSeconds,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  roundToNearestMinutes,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
  subDays,
  subMinutes
} from 'date-fns';

const US_DATE_REGEX = /^([0-9]{4})[\/-]([0-9]{2})[\/-]([0-9]{2})$/;

export class DateHelper {

  /**
   * Compara se a data informada é antes de agora.
   * @param dateToCheck A data que deve ser antes de agora
   *
   * @returns `true` se a data informada é antes de agora.
   */
  public static isDateBefore(dateToCheck: Date) {
    return isBefore(dateToCheck, new Date());
  }

  /**
   * Compara se a data informada é após agora
   * @param dateToCheck A data que deve ser depois de agora
   *
   * @returns `true` se a data informada é após agora.
   */
  public static isDateAfter(dateToCheck: Date) {
    return isAfter(dateToCheck, new Date());
  }

  /**
   * Verifica se uma data está entre um intervalo de tempo
   * @param date Data que será verificada
   * @param startDate Data de início do intervalo
   * @param endDate Data final do intervalo
   *
   * @returns `true` se a data informada está entre `startDate` e `endDate`
   */
  public static isDateBetween(date: Date, startDate: Date, endDate: Date): boolean {
    return isWithinInterval(date, {start: startDate, end: endDate});
  }

  /**
   * Soma o número de minutos informados à data
   * @param date Data que terá os minutos somados
   * @param minutes Minutos que serão somados da data
   *
   * @returns `Date` a nova data com os minutos somados
   */
  public static addMinutesToDate(date: Date, minutes: number): Date {
    return addMinutes(date, minutes);
  }

  /**
   * Soma o número de dias à data informada.
   * @param date Data base para a soma.
   * @param days O número de dias que serão somados à data.
   */
  public static addDaysToDate(date: Date, days: number): Date {
    return addDays(date, days);
  }

  /**
   * Retorna a diferença em segundos entre a duas datas informadas
   * @param startDate Data inicial
   * @param endDate Data final
   *
   * @returns `number` A diferença em segundos
   */
  public static diffInSeconds(startDate: Date, endDate: Date): number {
    return differenceInSeconds(endDate, startDate);
  }

  /**
   * Subtrai o número de minutos informados da data
   * @param date Data que terá os minutos subtraídos
   * @param minutes Minutos que serão subtraídos da data
   *
   * @returns A nova data com os minutos subtraídos
   */
  public static subMinutesFromDate(date: Date, minutes: number): Date {
    return subMinutes(date, minutes);
  }

  /**
   * Converte uma `string` no padrão `ISO 8601` para uma data
   * @param isoString `string` no padrão `ISO 8601` que será convertida
   * @returns `Date` A data da `string` informada
   */
  public static stringToDate(isoString: string): Date {
    return parseISO(isoString);
  }

  /**
   * Subtrai o número de dias informados da data
   * @param date Data que terá os dias subtraídos
   * @param days Dias que serão subtraídos da data
   *
   * @returns `Date` a nova data com os dias subtraídos
   */
  public static subDaysFromDate(date: Date, days: number): Date {
    return subDays(date, days);
  }

  /**
   * Converte a data informada em uma String no padrão 'yyyy-MM-dd'
   * @param date Data que será convertida
   */
  public static dateToString(date: Date) {
    return format(date, 'yyyy-MM-dd');
  }

  /**
   * Converte a data e hora informada em uma string no padrão 'yyyy-MM-dd HH:mm:ss'
   * @param dateTime Data e hora que será convertida
   */
  public static dateTimeToString(dateTime: Date) {
    return format(dateTime, 'yyyy-MM-dd HH:mm:ss');
  }

  /**
   * Retorna se as duas datas informadas são o mesmo dia
   * @param firstDate Primeira data para comparação
   * @param lastDate Segunda data para comparação
   */
  public static areSameDay(firstDate: Date, lastDate: Date) {
    return isSameDay(firstDate, lastDate);
  }

  /**
   * Retorna se as duas datas informadas são do mesmo mês
   * @param firstDate Primeira data para comparação
   * @param lastDate Segunda data para comparação
   */
  public static areSameMonth(firstDate: Date, lastDate: Date) {
    return isSameMonth(firstDate, lastDate);
  }

  /**
   * Arredonda uma data para os minutos mais próximos informados.
   * Por exemplo, se a data informada for 11:42 e os minutos mais próximos informados 30,
   * retorna uma data arredondada para 11:30
   * @param date A data para arredondar
   * @param nearestMinutes Os minutos para qual arredondar a data
   */
  public static roundNearestMinutes(date: Date, nearestMinutes: number) {
    return roundToNearestMinutes(date, {nearestTo: nearestMinutes});
  }

  /**
   * Formata uma data para string, baseado no formato informado.
   * @param date Data que será formatada
   * @param dateFormat Formado para formatação da data de acordo com a documentação
   * da Date-fns https://date-fns.org/v2.8.0/docs/format
   */
  public static dateToFormattedString(date: Date, dateFormat: string) {
    return format(date, dateFormat);
  }

  /**
   * Converte uma data no padrão americano yyyy-MM-dd
   * para um objeto de Data com a padronização correta,
   * se a string informada for inválida, retorna uma string vazia;
   * @param usStringDate Data no padrão americano
   */
  public static usStringToDate(usStringDate: string): Date | string {

    // Verifica se a string informada é válida
    if (usStringDate && US_DATE_REGEX.test(usStringDate)) {
      return parseISO(usStringDate);
    }
    return '';
  }

  /**
   * Define a hora de uma data
   * @param date Data para definir a hora
   * @param hours A hora que será definida na data
   * @param minutes Os minutos que serão definidos na hora, 0 por padrão
   * @param seconds Os segundos que serão definidos na hora, 0 por padrão
   * @param milliseconds Os milliseconds que serão definidos na hora, 0 por padrão
   * @returns Uma nova data com a hora definida
   */
  public static setHour(date: Date, hours: number, minutes = 0, seconds = 0, milliseconds = 0) {
    let newDate = setHours(date, hours);
    newDate = setMinutes(newDate, minutes);
    newDate = setSeconds(newDate, seconds);
    newDate = setMilliseconds(newDate, milliseconds);
    return newDate;
  }

}
